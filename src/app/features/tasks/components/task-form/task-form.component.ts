import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { 
  IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonNote,
  IonSelect, IonSelectOption, IonTitle, IonToolbar, ModalController 
} from '@ionic/angular';

import { ETaskPriority } from '../../models/task.enum';

import type { TAddTaskPayload } from '../../models/task.model';

import { todayKey } from '../../../../core/utils/date';

import { timeRange } from '../../validators/time-range.validator';
import { notBlank } from '../../../../core/validators/not-blank.validator';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, 
    IonButton, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, 
    IonNote
  ],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  readonly scheduledDate = input(todayKey());

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
      scheduledDate: [todayKey(), Validators.required],
      startTime: [''],
      endTime: [''],
    },
    { validators: timeRange }
  );

  ngOnInit(): void {
    this.form.controls.scheduledDate.setValue(this.scheduledDate());
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, priority, scheduledDate, startTime, endTime } = this.form.getRawValue();

    const task: TAddTaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      priority,
      scheduledDate,
      startTime: startTime || null,
      endTime: endTime || null,
    };

    void this.modalCtrl.dismiss(task, 'confirm');
  }

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }
}
