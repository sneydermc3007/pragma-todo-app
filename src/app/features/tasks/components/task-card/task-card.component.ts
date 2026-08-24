import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { IonButton, IonCheckbox, IonIcon } from '@ionic/angular';

import { ETaskPriority } from '../../models/task.enum';
import { formatTime } from '../../../../core/utils/date';
import type { ITask } from '../../models/task.model';

const PRIORITY_TONE: Record<ETaskPriority, string> = {
  [ETaskPriority.HIGH]: 'high',
  [ETaskPriority.MEDIUM]: 'medium',
  [ETaskPriority.LOW]: 'low',
};

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [IonCheckbox, IonIcon, IonButton],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent {
  readonly task = input.required<ITask>();
  readonly variant = input<'solid' | 'soft'>('soft');
  readonly showDate = input(false);

  readonly toggled = output<string>();
  readonly removed = output<string>();

  readonly tone = computed(() => PRIORITY_TONE[this.task().priority]);

  readonly schedule = computed(() => {
    const start = formatTime(this.task().startTime);
    const end = formatTime(this.task().endTime);

    if (!start) return null;

    return end ? `${start} – ${end}` : start;
  });

  readonly edited = computed(() => this.task().updatedAt !== this.task().createdAt);
}
