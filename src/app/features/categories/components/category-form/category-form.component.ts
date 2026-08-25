import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonNote,
         IonTitle, IonToolbar, ModalController } from '@ionic/angular';

import { TranslatePipe } from '@ngx-translate/core';

import { CATEGORY_COLORS } from '../../models/category.const';
import { uniqueName } from '../../validators/unique-name.validator';
import { notBlank } from '../../../../core/validators/not-blank.validator';

import type { ICategory, TAddCategoryPayload } from '../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [TranslatePipe, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
            IonContent, IonItem, IonInput, IonNote],
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  readonly category = input<ICategory | null>(null);
  readonly takenNames = input<readonly string[]>([]);

  readonly colors = CATEGORY_COLORS;

  readonly form = this.fb.nonNullable.group({
    name: ['', [notBlank, Validators.maxLength(40)]],
    color: [CATEGORY_COLORS[0] as string, Validators.required],
  });

  get isEditing(): boolean {
    return this.category() !== null;
  }

  ngOnInit(): void {
    const category = this.category();

    const taken = category
      ? this.takenNames().filter((name) => name !== category.name)
      : this.takenNames();

    this.form.controls.name.addValidators(uniqueName(taken));

    if (category) {
      this.form.patchValue({ name: category.name, color: category.color });
    }
  }

  pick(color: string): void {
    this.form.controls.color.setValue(color);
    this.form.controls.color.markAsDirty();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, color } = this.form.getRawValue();
    const payload: TAddCategoryPayload = { name: name.trim(), color };

    void this.modalCtrl.dismiss(payload, 'confirm');
  }

  cancel(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }
}
