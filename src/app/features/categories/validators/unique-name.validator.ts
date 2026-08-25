import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const uniqueName = (takenNames: readonly string[]): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim().toLowerCase() : '';

    if (!value) return null;

    return takenNames.some((name) => name.trim().toLowerCase() === value)
      ? { uniqueName: true }
      : null;
  };
