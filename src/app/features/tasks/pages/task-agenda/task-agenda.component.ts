import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
         IonToolbar, ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskFormComponent } from '../../components/task-form/task-form.component';

import { TaskActions } from '../../store/task.actions';
import { selectVisibleTasks, tasksOfDay } from '../../store/task.selectors';
import { toDateKey, todayKey, weekOf } from '../../../../core/utils/date';
import type { TAddTaskPayload } from '../../models/task.model';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

@Component({
  selector: 'app-task-agenda',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonButton, IonIcon,
            IonContent, TaskCardComponent],
  templateUrl: './task-agenda.component.html',
  styleUrls: ['./task-agenda.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskAgendaComponent implements OnInit {
  private store = inject(Store);
  private modalCtrl = inject(ModalController);

  private readonly visibleTasks = this.store.selectSignal(selectVisibleTasks);

  readonly selectedDate = signal(todayKey());

  readonly tasks = computed(() => tasksOfDay(this.visibleTasks(), this.selectedDate()));

  readonly today = todayKey();

  readonly week = computed(() =>
    weekOf(new Date()).map((date) => ({
      key: toDateKey(date),
      label: DAY_LABELS[(date.getDay() + 6) % 7],
      number: date.getDate(),
    }))
  );

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  select(dateKey: string): void {
    this.selectedDate.set(dateKey);
  }

  async openForm(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: { scheduledDate: this.selectedDate() },
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

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }

  remove(id: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id }));
  }
}
