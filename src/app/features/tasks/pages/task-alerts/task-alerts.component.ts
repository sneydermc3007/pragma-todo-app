import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { Store } from '@ngrx/store';


import { TaskActions } from '../../store/task.actions';
import { selectOverdueTasks, selectUpcomingTasks } from '../../store/task.selectors';

import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-task-alerts',
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
    IonContent, TaskCardComponent
  ],
  templateUrl: './task-alerts.component.html',
  styleUrls: ['./task-alerts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskAlertsComponent implements OnInit {
  private store = inject(Store);

  readonly overdue = this.store.selectSignal(selectOverdueTasks);
  readonly upcoming = this.store.selectSignal(selectUpcomingTasks);

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }
}
