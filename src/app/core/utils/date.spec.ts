import { formatTime, monthKey, toDateKey, weekOf } from './date';

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
  });
});
