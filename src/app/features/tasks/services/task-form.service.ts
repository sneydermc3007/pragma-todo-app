import { inject, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Store } from '@ngrx/store';

import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskActions } from '../store/task.actions';
import { selectAllCategories } from '../../categories/store/category.selectors';
import { todayKey } from '../../../core/utils/date';

import type { ITask, TAddTaskPayload } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskFormService {
  private store = inject(Store);
  private modalCtrl = inject(ModalController);

  private readonly categories = this.store.selectSignal(selectAllCategories);

  async open(task: ITask | null = null, scheduledDate: string = todayKey()): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TaskFormComponent,
      componentProps: { task, scheduledDate, categories: this.categories() },
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
      handle: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<TAddTaskPayload>();

    if (role !== 'confirm' || !data) return;

    this.store.dispatch(
      task
        ? TaskActions.updateTask({ id: task.id, changes: data })
        : TaskActions.addTask({ task: data })
    );
  }
}
