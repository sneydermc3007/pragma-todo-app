import { defaultTimeRange, formatTime, monthKey, toDateKey, toHourMinute, weekOf } from './date';

describe('utils/date', () => {
  describe('toDateKey', () => {
    it('usa la fecha local y rellena con ceros', () => {
      expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    });

    it('no corre el día para una hora nocturna', () => {
      expect(toDateKey(new Date(2026, 7, 23, 23, 30))).toBe('2026-08-23');
    });
  });

  it('monthKey recorta al mes', () => {
    expect(monthKey('2026-08-23')).toBe('2026-08');
  });

  describe('weekOf', () => {
    it('devuelve siete días que arrancan en lunes', () => {
      const week = weekOf(new Date(2026, 7, 23));

      expect(week).toHaveLength(7);
      expect(week[0].getDay()).toBe(1);
      expect(toDateKey(week[0])).toBe('2026-08-17');
      expect(toDateKey(week[6])).toBe('2026-08-23');
    });

    it('trata el domingo como último día de la semana, no primero', () => {
      const week = weekOf(new Date(2026, 7, 17));

      expect(toDateKey(week[0])).toBe('2026-08-17');
      expect(week[6].getDay()).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('pasa a 12 horas con periodo', () => {
      expect(formatTime('14:30')).toBe('2:30 PM');
      expect(formatTime('09:05')).toBe('9:05 AM');
    });

    it('la medianoche es 12 AM y el mediodía 12 PM', () => {
      expect(formatTime('00:15')).toBe('12:15 AM');
      expect(formatTime('12:00')).toBe('12:00 PM');
    });

    it('devuelve null si no hay hora', () => {
      expect(formatTime(null)).toBeNull();
    });

    it('devuelve la hora tal cual en formato de 24 horas', () => {
      expect(formatTime('14:30', true)).toBe('14:30');
      expect(formatTime('09:05', true)).toBe('09:05');
      expect(formatTime('00:15', true)).toBe('00:15');
    });

    it('sigue devolviendo null sin hora aunque sea 24 horas', () => {
      expect(formatTime(null, true)).toBeNull();
    });
  });

  describe('toHourMinute', () => {
    it('acepta HH:mm tal cual', () => {
      expect(toHourMinute('14:30')).toBe('14:30');
    });

    it('recorta los segundos', () => {
      expect(toHourMinute('14:30:00')).toBe('14:30');
    });

    it('extrae la hora de un ISO completo', () => {
      expect(toHourMinute('2026-08-25T09:05:00-05:00')).toBe('09:05');
    });

    it('devuelve vacío con nulos o basura', () => {
      expect(toHourMinute(null)).toBe('');
      expect(toHourMinute(undefined)).toBe('');
      expect(toHourMinute('')).toBe('');
      expect(toHourMinute(['14:30'])).toBe('');
    });
  });

  describe('defaultTimeRange', () => {
    it('propone la próxima hora en punto y una hora de duración', () => {
      expect(defaultTimeRange(new Date(2026, 7, 25, 9, 17))).toEqual({ start: '10:00', end: '11:00' });
    });

    it('rellena con cero las horas de un dígito', () => {
      expect(defaultTimeRange(new Date(2026, 7, 25, 6, 0))).toEqual({ start: '07:00', end: '08:00' });
    });

    it('no cruza la medianoche: al final del día se queda en 22:00 – 23:00', () => {
      expect(defaultTimeRange(new Date(2026, 7, 25, 22, 40))).toEqual({ start: '22:00', end: '23:00' });
      expect(defaultTimeRange(new Date(2026, 7, 25, 23, 59))).toEqual({ start: '22:00', end: '23:00' });
    });

    it('el rango que propone siempre es válido', () => {
      for (let hour = 0; hour < 24; hour++) {
        const { start, end } = defaultTimeRange(new Date(2026, 7, 25, hour, 0));

        expect(end > start).toBe(true);
      }
    });
  });
});
