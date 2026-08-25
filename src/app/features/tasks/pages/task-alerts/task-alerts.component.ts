import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { IonBackButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { Store } from '@ngrx/store';
import { TranslatePipe } from '@ngx-translate/core';


import { TaskActions } from '../../store/task.actions';
import { TaskFormService } from '../../services/task-form.service';
import { TaskFeedbackService } from '../../services/task-feedback.service';
import { selectOverdueTasks, selectUpcomingTasks } from '../../store/task.selectors';
import { CategoryActions } from '../../../categories/store/category.actions';
import { selectUse24hClock } from '../../../remote-config/store/remote-config.selectors';
import { selectCategoryEntities } from '../../../categories/store/category.selectors';

import type { ITask } from '../../models/task.model';
import type { ICategory } from '../../../categories/models/category.model';

import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-task-alerts',
  standalone: true,
  imports: [
    TranslatePipe,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, 
    IonContent, TaskCardComponent
  ],
  templateUrl: './task-alerts.component.html',
  styleUrls: ['./task-alerts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskAlertsComponent implements OnInit {
  private store = inject(Store);

  readonly use24hClock = this.store.selectSignal(selectUse24hClock);
  private taskForm = inject(TaskFormService);
  private feedback = inject(TaskFeedbackService);

  readonly overdue = this.store.selectSignal(selectOverdueTasks);
  readonly upcoming = this.store.selectSignal(selectUpcomingTasks);
  private readonly categoryEntities = this.store.selectSignal(selectCategoryEntities);

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
    this.store.dispatch(CategoryActions.loadCategories());
  }

  categoryOf(task: ITask): ICategory | null {
    return task.categoryId ? this.categoryEntities()[task.categoryId] ?? null : null;
  }

  openForm(task: ITask): void {
    void this.taskForm.open(task);
  }

  async remove(task: ITask): Promise<void> {
    if (!(await this.feedback.confirmDelete(task.title))) return;

    this.store.dispatch(TaskActions.deleteTask({ id: task.id }));
    await this.feedback.notify('toast.taskDeleted');
  }

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }
}
