import type { AbstractControl, ValidationErrors } from '@angular/forms';

export const timeRange = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('startTime')?.value as string | null;
  const end = group.get('endTime')?.value as string | null;

  if (!start || !end) return null;

  return end > start ? null : { timeRange: true };
};
