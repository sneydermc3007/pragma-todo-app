export const toDateKey = (date: Date): string => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
};

export const todayKey = (): string => toDateKey(new Date());

export const monthKey = (dateKey: string): string => dateKey.slice(0, 7);

export const weekOf = (date: Date): Date[] => {
  const monday = new Date(date);
  const offset = (date.getDay() + 6) % 7;
  monday.setDate(date.getDate() - offset);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);

    return day;
  });
};

export const formatTime = (time: string | null, use24hClock = false): string | null => {
  if (!time) return null;
  if (use24hClock) return time;

  const [rawHours, minutes] = time.split(':');
  const hours = Number(rawHours);
  const period = hours < 12 ? 'AM' : 'PM';
  const display = hours % 12 === 0 ? 12 : hours % 12;

  return `${display}:${minutes} ${period}`;
};

export const toHourMinute = (value: unknown): string => {
  if (typeof value !== 'string') return '';

  const match = value.match(/(\d{2}):(\d{2})/);

  return match ? `${match[1]}:${match[2]}` : '';
};

export const defaultTimeRange = (now = new Date()): { start: string; end: string } => {
  const startHour = Math.min(now.getHours() + 1, 22);
  const pad = (hour: number): string => `${hour}`.padStart(2, '0');

  return { start: `${pad(startHour)}:00`, end: `${pad(startHour + 1)}:00` };
};
