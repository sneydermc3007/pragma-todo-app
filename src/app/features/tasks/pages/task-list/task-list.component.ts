import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton,
         IonSearchbar, IonToolbar, ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

import { TaskActions } from '../../store/task.actions';
import { selectError, selectMonthTaskCount, selectSearchTerm, selectTodayTasks,
         selectVisibleTasks } from '../../store/task.selectors';
import type { TAddTaskPayload } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    RouterLink, IonHeader, IonToolbar, IonButtons, IonMenuButton, 
    IonButton, IonIcon, IonContent, IonSearchbar, TaskCardComponent
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent implements OnInit {
  private store = inject(Store);
  private modalCtrl = inject(ModalController);
  private router = inject(Router);

  readonly monthCount = this.store.selectSignal(selectMonthTaskCount);
  readonly todayTasks = this.store.selectSignal(selectTodayTasks);
  readonly visibleTasks = this.store.selectSignal(selectVisibleTasks);
  readonly searchTerm = this.store.selectSignal(selectSearchTerm);
  readonly error = this.store.selectSignal(selectError);

  private readonly hour = signal(new Date().getHours());

  readonly greeting = computed(() => {
    const hour = this.hour();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';

    return 'Buenas noches';
  });

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  search(term: string | null | undefined): void {
    this.store.dispatch(TaskActions.setSearchTerm({ term: term ?? '' }));
  }

  async openForm(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
      handle: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<TAddTaskPayload>();

    if (role === 'confirm' && data) {
      this.store.dispatch(TaskActions.addTask({ task: data }));
    }
  }

  goToAgenda(): void {
    void this.router.navigate(['/tasks/agenda']);
  }

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }

  remove(id: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id }));
  }
}
