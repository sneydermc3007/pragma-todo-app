import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonNote,
         IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController } from '@ionic/angular';

import { ETaskPriority } from '../../models/task.enum';
import { todayKey } from '../../../../core/utils/date';
import { notBlank } from '../../../../core/validators/not-blank.validator';
import { timeRange } from '../../validators/time-range.validator';

import type { ITask, TAddTaskPayload } from '../../models/task.model';
import type { ICategory } from '../../../categories/models/category.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
            IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonNote],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  readonly scheduledDate = input(todayKey());
  readonly task = input<ITask | null>(null);
  readonly categories = input<readonly ICategory[]>([]);

  readonly priorities = Object.values(ETaskPriority);

  readonly priorityLabels: Record<ETaskPriority, string> = {
    [ETaskPriority.HIGH]: 'Alta',
    [ETaskPriority.MEDIUM]: 'Media',
    [ETaskPriority.LOW]: 'Baja',
  };

  readonly form = this.fb.nonNullable.group(
    {
      title: ['', [notBlank, Validators.maxLength(120)]],
      description: ['', Validators.maxLength(500)],
      priority: [ETaskPriority.MEDIUM, Validators.required],
      categoryId: [''],
      scheduledDate: [todayKey(), Validators.required],
      startTime: [''],
      endTime: [''],
    },
    { validators: timeRange }
  );

  get isEditing(): boolean {
    return this.task() !== null;
  }

  ngOnInit(): void {
    const task = this.task();

    if (!task) {
      this.form.controls.scheduledDate.setValue(this.scheduledDate());
      return;
    }

    this.form.patchValue({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      categoryId: task.categoryId ?? '',
      scheduledDate: task.scheduledDate,
      startTime: task.startTime ?? '',
      endTime: task.endTime ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, priority, categoryId, scheduledDate, startTime, endTime } =
      this.form.getRawValue();

    const payload: TAddTaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      categoryId: categoryId || null,
      scheduledDate,
      startTime: startTime || null,
      endTime: endTime || null,
    };

    void this.modalCtrl.dismiss(payload, 'confirm');
  }

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }
}
