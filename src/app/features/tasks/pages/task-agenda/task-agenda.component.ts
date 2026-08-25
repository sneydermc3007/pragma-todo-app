import { ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID, OnInit, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
         IonToolbar } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { TaskCardComponent } from '../../components/task-card/task-card.component';

import { TaskActions } from '../../store/task.actions';
import { TaskFormService } from '../../services/task-form.service';
import { TaskFeedbackService } from '../../services/task-feedback.service';
import { selectVisibleTasks, tasksOfDay } from '../../store/task.selectors';
import { CategoryActions } from '../../../categories/store/category.actions';
import { selectUse24hClock } from '../../../remote-config/store/remote-config.selectors';
import { selectAllCategories, selectCategoryEntities } from '../../../categories/store/category.selectors';
import { toDateKey, todayKey, weekOf } from '../../../../core/utils/date';
import type { ITask } from '../../models/task.model';
import type { ICategory } from '../../../categories/models/category.model';

@Component({
  selector: 'app-task-agenda',
  standalone: true,
  imports: [TranslatePipe, IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon,
            IonContent, TaskCardComponent],
  templateUrl: './task-agenda.component.html',
  styleUrls: ['./task-agenda.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskAgendaComponent implements OnInit {
  private store = inject(Store);

  readonly use24hClock = this.store.selectSignal(selectUse24hClock);
  private taskForm = inject(TaskFormService);
  private feedback = inject(TaskFeedbackService);
  private locale = inject(LOCALE_ID);

  private readonly visibleTasks = this.store.selectSignal(selectVisibleTasks);

  readonly selectedDate = signal(todayKey());

  readonly tasks = computed(() => tasksOfDay(this.visibleTasks(), this.selectedDate()));

  readonly today = todayKey();

  readonly categories = this.store.selectSignal(selectAllCategories);
  private readonly categoryEntities = this.store.selectSignal(selectCategoryEntities);

  readonly week = computed(() =>
    weekOf(new Date()).map((date) => ({
      key: toDateKey(date),
      label: formatDate(date, 'EEE', this.locale),
      number: date.getDate(),
    }))
  );

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
    this.store.dispatch(CategoryActions.loadCategories());
  }

  categoryOf(task: ITask): ICategory | null {
    return task.categoryId ? this.categoryEntities()[task.categoryId] ?? null : null;
  }

  select(dateKey: string): void {
    this.selectedDate.set(dateKey);
  }

  openForm(task: ITask | null = null): void {
    void this.taskForm.open(task, this.selectedDate());
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
