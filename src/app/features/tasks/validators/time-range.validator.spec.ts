import { FormControl, FormGroup } from '@angular/forms';

import { timeRange } from './time-range.validator';

describe('timeRange', () => {
  const validate = (startTime: string | null, endTime: string | null) =>
    timeRange(
      new FormGroup({
        startTime: new FormControl(startTime),
        endTime: new FormControl(endTime),
      })
    );

  it('acepta un rango con la hora de fin posterior', () => {
    expect(validate('09:00', '10:30')).toBeNull();
  });

  it('rechaza que la hora de fin sea anterior a la de inicio', () => {
    expect(validate('10:30', '09:00')).toEqual({ timeRange: true });
  });

  it('rechaza que las dos horas sean la misma', () => {
    expect(validate('09:00', '09:00')).toEqual({ timeRange: true });
  });

  it('compara también los minutos, no solo la hora', () => {
    expect(validate('09:15', '09:45')).toBeNull();
    expect(validate('09:45', '09:15')).toEqual({ timeRange: true });
  });

  it('no opina si falta alguna de las dos horas, porque son opcionales', () => {
    expect(validate(null, '10:00')).toBeNull();
    expect(validate('09:00', null)).toBeNull();
    expect(validate(null, null)).toBeNull();
    expect(validate('', '')).toBeNull();
  });

  it('no se confunde con las horas de un dígito de la mañana', () => {
    expect(validate('08:00', '10:00')).toBeNull();
    expect(validate('10:00', '08:00')).toEqual({ timeRange: true });
  });
});
