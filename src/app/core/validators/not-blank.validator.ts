import type { AbstractControl, ValidationErrors } from '@angular/forms';

export const notBlank = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.trim().length > 0 ? null : { required: true };
