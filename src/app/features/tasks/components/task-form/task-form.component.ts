import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonDatetime, IonDatetimeButton, IonHeader,
         IonInput, IonItem, IonLabel, IonModal, IonNote, IonSelect, IonSelectOption,
         IonTitle, IonToolbar, ModalController } from '@ionic/angular';

import { TranslatePipe } from '@ngx-translate/core';

import { ETaskPriority } from '../../models/task.enum';
import { defaultTimeRange, todayKey, toHourMinute } from '../../../../core/utils/date';
import { notBlank } from '../../../../core/validators/not-blank.validator';
import { timeRange } from '../../validators/time-range.validator';

import type { ITask, TAddTaskPayload } from '../../models/task.model';
import type { ICategory } from '../../../categories/models/category.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons,
            IonButton, IonContent, IonItem, IonInput, IonSelect, IonSelectOption, IonNote,
            IonLabel, IonDatetime, IonDatetimeButton, IonModal],
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
  readonly use24hClock = input(false);

  readonly hourCycle = computed(() => (this.use24hClock() ? 'h23' : 'h12'));

  readonly priorities = Object.values(ETaskPriority);

  readonly priorityKey = (priority: ETaskPriority): string => `priority.${priority}`;

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

  timeValue(control: 'startTime' | 'endTime'): string | null {
    const value = this.form.controls[control].value;

    return value ? `${value}:00` : null;
  }

  setTime(control: 'startTime' | 'endTime', value: unknown): void {
    this.form.controls[control].setValue(toHourMinute(value));
    this.form.controls[control].markAsDirty();
  }

  get isEditing(): boolean {
    return this.task() !== null;
  }

  ngOnInit(): void {
    const task = this.task();

    if (!task) {
      const { start, end } = defaultTimeRange();

      this.form.patchValue({
        scheduledDate: this.scheduledDate(),
        startTime: start,
        endTime: end,
      });

      return;
    }

    const { start, end } = defaultTimeRange();

    this.form.patchValue({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      categoryId: task.categoryId ?? '',
      scheduledDate: task.scheduledDate,
      startTime: task.startTime ?? start,
      endTime: task.endTime ?? end,
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
