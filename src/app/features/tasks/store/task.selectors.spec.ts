import {
    selectCompletedTasks, selectMonthTaskCount, selectOverdueTasks, selectPendingTasks,
    selectTaskById, selectTaskCountByCategory, selectTasksByCategoryId, selectTodayTasks,
    selectUpcomingTasks, selectVisibleTasks, tasksOfDay, UNCATEGORIZED,
} from './task.selectors';
import { ETaskPriority } from '../models/task.enum';

import type { ITask } from '../models/task.model';

const task = (overrides: Partial<ITask> = {}): ITask => ({
    id: 'task-1',
    title: 'Comprar café',
    description: null,
    priority: ETaskPriority.MEDIUM,
    completed: false,
    categoryId: 'cat-1',
    scheduledDate: '2026-08-25',
    startTime: null,
    endTime: null,
    createdAt: '2026-08-25T10:00:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
    ...overrides,
});

const ids = (tasks: readonly ITask[]): string[] => tasks.map((t) => t.id);

describe('selectVisibleTasks', () => {
    const tasks = [
        task({ id: 'cafe', title: 'Comprar café', categoryId: 'cat-1' }),
        task({ id: 'pan', title: 'Comprar pan', description: 'con semillas', categoryId: 'cat-2' }),
        task({ id: 'suelta', title: 'Llamar al banco', categoryId: null }),
    ];

    const visible = (term: string, categoryId: string | null = null): string[] =>
        ids(selectVisibleTasks.projector(tasks, term, categoryId));

    it('sin filtros devuelve todas', () => {
        expect(visible('')).toEqual(['cafe', 'pan', 'suelta']);
    });

    it('busca en el título sin distinguir mayúsculas', () => {
        expect(visible('CAFÉ')).toEqual(['cafe']);
    });

    it('busca también en la descripción', () => {
        expect(visible('semillas')).toEqual(['pan']);
    });

    it('ignora los espacios de los extremos del término', () => {
        expect(visible('  banco  ')).toEqual(['suelta']);
    });

    it('un término de solo espacios equivale a no buscar', () => {
        expect(visible('   ')).toEqual(['cafe', 'pan', 'suelta']);
    });

    it('devuelve vacío si nada coincide', () => {
        expect(visible('zapatos')).toEqual([]);
    });

    it('filtra por categoría', () => {
        expect(visible('', 'cat-2')).toEqual(['pan']);
    });

    it('filtra las que quedaron sin categoría', () => {
        expect(visible('', UNCATEGORIZED)).toEqual(['suelta']);
    });

    it('combina el término con la categoría', () => {
        expect(visible('comprar', 'cat-1')).toEqual(['cafe']);
        expect(visible('banco', 'cat-1')).toEqual([]);
    });
});

describe('conteos y búsquedas por categoría', () => {
    const tasks = [
        task({ id: '1', categoryId: 'cat-1' }),
        task({ id: '2', categoryId: 'cat-1' }),
        task({ id: '3', categoryId: 'cat-2' }),
        task({ id: '4', categoryId: null }),
    ];

    it('selectTaskCountByCategory cuenta por categoría y agrupa las sueltas', () => {
        expect(selectTaskCountByCategory.projector(tasks)).toEqual({
            'cat-1': 2,
            'cat-2': 1,
            [UNCATEGORIZED]: 1,
        });
    });

    it('selectTaskCountByCategory no inventa categorías vacías', () => {
        expect(selectTaskCountByCategory.projector([])).toEqual({});
    });

    it('selectTasksByCategoryId devuelve solo las de esa categoría', () => {
        expect(ids(selectTasksByCategoryId('cat-1').projector(tasks))).toEqual(['1', '2']);
    });

    it('selectTaskById devuelve la tarea o undefined', () => {
        const entities = { 'task-1': task() };

        expect(selectTaskById('task-1').projector(entities)?.title).toBe('Comprar café');
        expect(selectTaskById('task-9').projector(entities)).toBeUndefined();
    });
});

describe('tasksOfDay', () => {
    const tasks = [
        task({ id: 'tarde', scheduledDate: '2026-08-25', startTime: '15:00' }),
        task({ id: 'manana', scheduledDate: '2026-08-25', startTime: '09:30' }),
        task({ id: 'sinhora', scheduledDate: '2026-08-25', startTime: null }),
        task({ id: 'otrodia', scheduledDate: '2026-08-26', startTime: '08:00' }),
    ];

    it('devuelve solo las del día pedido, ordenadas por hora', () => {
        expect(ids(tasksOfDay(tasks, '2026-08-25'))).toEqual(['manana', 'tarde', 'sinhora']);
    });

    it('deja al final las que no tienen hora', () => {
        expect(ids(tasksOfDay(tasks, '2026-08-25')).at(-1)).toBe('sinhora');
    });

    it('no muta el arreglo que recibe', () => {
        const original = [...tasks];

        tasksOfDay(tasks, '2026-08-25');

        expect(tasks).toEqual(original);
    });

    it('devuelve vacío para un día sin tareas', () => {
        expect(tasksOfDay(tasks, '2026-09-01')).toEqual([]);
    });
});

describe('selectPendingTasks y selectCompletedTasks', () => {
    const tasks = [task({ id: '1', completed: true }), task({ id: '2', completed: false })];

    it('selectCompletedTasks devuelve solo las completadas', () => {
        expect(ids(selectCompletedTasks.projector(tasks))).toEqual(['1']);
    });

    it('selectPendingTasks devuelve solo las pendientes', () => {
        expect(ids(selectPendingTasks.projector(tasks))).toEqual(['2']);
    });
});

describe('selectores que dependen de hoy', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date(2026, 7, 25, 12, 0, 0));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('selectTodayTasks', () => {
        it('devuelve las de hoy ordenadas por hora', () => {
            const tasks = [
                task({ id: 'hoy-tarde', scheduledDate: '2026-08-25', startTime: '15:00' }),
                task({ id: 'hoy-manana', scheduledDate: '2026-08-25', startTime: '09:00' }),
                task({ id: 'ayer', scheduledDate: '2026-08-24' }),
                task({ id: 'manana', scheduledDate: '2026-08-26' }),
            ];

            expect(ids(selectTodayTasks.projector(tasks))).toEqual(['hoy-manana', 'hoy-tarde']);
        });
    });

    describe('selectMonthTaskCount', () => {
        it('cuenta las agendadas en el mes en curso', () => {
            const tasks = [
                task({ id: '1', scheduledDate: '2026-08-01' }),
                task({ id: '2', scheduledDate: '2026-08-31' }),
                task({ id: '3', scheduledDate: '2026-07-31' }),
                task({ id: '4', scheduledDate: '2026-09-01' }),
            ];

            expect(selectMonthTaskCount.projector(tasks)).toBe(2);
        });

        it('cuenta por la fecha agendada, no por la de creación', () => {
            const tasks = [
                task({ id: '1', scheduledDate: '2026-12-01', createdAt: '2026-08-25T10:00:00.000Z' }),
            ];

            expect(selectMonthTaskCount.projector(tasks)).toBe(0);
        });
    });

    describe('selectOverdueTasks', () => {
        it('devuelve las pendientes anteriores a hoy', () => {
            const pendientes = [
                task({ id: 'vencida', scheduledDate: '2026-08-24' }),
                task({ id: 'hoy', scheduledDate: '2026-08-25' }),
                task({ id: 'futura', scheduledDate: '2026-08-26' }),
            ];

            expect(ids(selectOverdueTasks.projector(pendientes))).toEqual(['vencida']);
        });

        it('las de hoy no están vencidas aunque la hora ya haya pasado', () => {
            const pendientes = [task({ id: 'hoy', scheduledDate: '2026-08-25', startTime: '08:00' })];

            expect(selectOverdueTasks.projector(pendientes)).toEqual([]);
        });
    });

    describe('selectUpcomingTasks', () => {
        it('devuelve desde hoy en adelante, ordenadas por fecha y hora', () => {
            const pendientes = [
                task({ id: 'manana-tarde', scheduledDate: '2026-08-26', startTime: '18:00' }),
                task({ id: 'hoy-tarde', scheduledDate: '2026-08-25', startTime: '15:00' }),
                task({ id: 'manana-temprano', scheduledDate: '2026-08-26', startTime: '08:00' }),
                task({ id: 'vencida', scheduledDate: '2026-08-24' }),
            ];

            expect(ids(selectUpcomingTasks.projector(pendientes))).toEqual([
                'hoy-tarde', 'manana-temprano', 'manana-tarde',
            ]);
        });

        it('dentro del mismo día deja al final las que no tienen hora', () => {
            const pendientes = [
                task({ id: 'sinhora', scheduledDate: '2026-08-25', startTime: null }),
                task({ id: 'conhora', scheduledDate: '2026-08-25', startTime: '23:00' }),
            ];

            expect(ids(selectUpcomingTasks.projector(pendientes))).toEqual(['conhora', 'sinhora']);
        });
    });
});
