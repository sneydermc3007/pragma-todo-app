import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { IonButton, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonNote, IonSelect, IonSelectOption, IonText, IonTitle, IonToolbar } from '@ionic/angular';

import { Store } from '@ngrx/store';

import { ETaskPriority } from '../../core/enum/task.enum';
import { notBlank } from '../../core/validators/not-blank.validator';

import { TaskActions } from '../../store/tasks/task.actions';
import { selectAllTasks, selectError, selectLoading } from '../../store/tasks/task.selectors';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonInput, IonSelect, IonSelectOption,
    IonButton, IonText, IonList, IonCheckbox, IonLabel, IonIcon,
    IonNote
  ],
})
export class TasksComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly tasks$ = this.store.select(selectAllTasks);
  readonly loading$ = this.store.select(selectLoading);
  readonly error$ = this.store.select(selectError);

  readonly priorities = Object.values(ETaskPriority);

  /**
   * `nonNullable` hace que los controles sean `FormControl<string>` en vez de
   * `FormControl<string | null>`, así `getRawValue()` calza con el payload de
   * la acción sin chequeos de null.
   */
  readonly form = this.fb.nonNullable.group({
    title: ['', [notBlank, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)],
    priority: [ETaskPriority.MEDIUM, Validators.required],
  });

  private readonly emptyForm = {
    title: '',
    description: '',
    priority: ETaskPriority.MEDIUM,
  };

  ngOnInit(): void {
    this.store.dispatch(TaskActions.loadTasks());
  }

  add(): void {
    if (this.form.invalid) {
      // Sin esto los mensajes de error no aparecen hasta que el usuario toca
      // cada campo, y un submit con el formulario vacío no daría feedback.
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, priority } = this.form.getRawValue();

    this.store.dispatch(TaskActions.addTask({
      task: {
        title: title.trim(),
        description: description.trim() || null,
        priority,
      },
    }));

    this.form.reset(this.emptyForm);
  }

  toggle(id: string): void {
    this.store.dispatch(TaskActions.toggleTask({ id }));
  }

  remove(id: string): void {
    this.store.dispatch(TaskActions.deleteTask({ id }));
  }
}
