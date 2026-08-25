import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton,
         IonSearchbar, IonToolbar } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';

import { TaskCardComponent } from '../../components/task-card/task-card.component';

import { TaskActions } from '../../store/task.actions';
import { TaskFormService } from '../../services/task-form.service';
import { TaskFeedbackService } from '../../services/task-feedback.service';
import { selectActiveCategoryId, selectError, selectMonthTaskCount, selectSearchTerm,
         selectTaskCountByCategory, selectTodayTasks, selectVisibleTasks,
         UNCATEGORIZED } from '../../store/task.selectors';
import { CategoryActions } from '../../../categories/store/category.actions';
import { selectUse24hClock } from '../../../remote-config/store/remote-config.selectors';
import { selectAllCategories, selectCategoryEntities } from '../../../categories/store/category.selectors';

import type { ITask } from '../../models/task.model';
import type { ICategory } from '../../../categories/models/category.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [ScrollingModule, TranslatePipe, RouterLink, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonButton,
            IonIcon, IonContent, IonSearchbar, TaskCardComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit {
  private store = inject(Store);

  readonly use24hClock = this.store.selectSignal(selectUse24hClock);
  private taskForm = inject(TaskFormService);
  private feedback = inject(TaskFeedbackService);
  private router = inject(Router);

  readonly monthCount = this.store.selectSignal(selectMonthTaskCount);
  readonly todayTasks = this.store.selectSignal(selectTodayTasks);
  readonly visibleTasks = this.store.selectSignal(selectVisibleTasks);
  readonly searchTerm = this.store.selectSignal(selectSearchTerm);
  readonly error = this.store.selectSignal(selectError);

  readonly categories = this.store.selectSignal(selectAllCategories);
  readonly activeCategoryId = this.store.selectSignal(selectActiveCategoryId);
  private readonly categoryEntities = this.store.selectSignal(selectCategoryEntities);
  private readonly taskCounts = this.store.selectSignal(selectTaskCountByCategory);

  readonly uncategorized = UNCATEGORIZED;

  readonly uncategorizedCount = computed(() => this.taskCounts()[UNCATEGORIZED] ?? 0);

  readonly hasActiveFilters = computed(
    () => this.searchTerm().trim().length > 0 || this.activeCategoryId() !== null
  );

  private readonly hour = signal(new Date().getHours());

  readonly greetingKey = computed(() => {
    const hour = this.hour();
    if (hour < 12) return 'greeting.morning';
    if (hour < 19) return 'greeting.afternoon';

    return 'greeting.evening';
  });

  readonly headlineKey = computed(() =>
    this.monthCount() === 1 ? 'home.headline.one' : 'home.headline.other'
  );

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly viewport = viewChild(CdkVirtualScrollViewport);
  private restoreOffset = 0;

  ionViewWillLeave(): void {
    this.restoreOffset = this.scroller()?.nativeElement.scrollTop ?? 0;
  }

  ionViewDidEnter(): void {
    const scroller = this.scroller()?.nativeElement;

    if (!scroller) return;

    this.viewport()?.checkViewportSize();
    scroller.scrollTop = this.restoreOffset;
  }

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
    this.store.dispatch(CategoryActions.loadCategories());
  }

  trackById(_index: number, task: ITask): string {
    return task.id;
  }

  categoryOf(task: ITask): ICategory | null {
    return task.categoryId ? this.categoryEntities()[task.categoryId] ?? null : null;
  }

  countFor(category: ICategory): number {
    return this.taskCounts()[category.id] ?? 0;
  }

  filterBy(categoryId: string | null): void {
    this.store.dispatch(TaskActions.setActiveCategory({ categoryId }));
  }

  search(term: string | null | undefined): void {
    this.store.dispatch(TaskActions.setSearchTerm({ term: term ?? '' }));
  }

  openForm(task: ITask | null = null): void {
    void this.taskForm.open(task);
  }

  goToAgenda(): void {
    void this.router.navigate(['/tasks/agenda']);
  }

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }

  async remove(task: ITask): Promise<void> {
    if (!(await this.feedback.confirmDelete(task.title))) return;

    this.store.dispatch(TaskActions.deleteTask({ id: task.id }));
    await this.feedback.notify('toast.taskDeleted');
  }
}
