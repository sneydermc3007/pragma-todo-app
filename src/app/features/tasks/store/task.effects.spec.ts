import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { firstValueFrom, Observable, of, throwError } from 'rxjs';

import { TaskEffects } from './task.effects';
import { TaskActions } from './task.actions';
import { selectAllTasks } from './task.selectors';
import { CategoryActions } from '../../categories/store/category.actions';
import { TaskService } from '../services/task.service';
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

describe('TaskEffects · unassignDeletedCategory$', () => {
    let actions$: Observable<unknown>;
    let effects: TaskEffects;
    let taskService: { getAll: ReturnType<typeof vi.fn>; saveAll: ReturnType<typeof vi.fn> };

    const setup = (tasks: ITask[]): void => {
        TestBed.resetTestingModule();

        taskService = {
            getAll: vi.fn().mockReturnValue(of([])),
            saveAll: vi.fn().mockReturnValue(of(undefined)),
        };

        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
        provideTranslateService(),
                TaskEffects,
                provideMockActions(() => actions$),
                provideMockStore({ selectors: [{ selector: selectAllTasks, value: tasks }] }),
                { provide: TaskService, useValue: taskService },
            ],
        });

        effects = TestBed.inject(TaskEffects);
    };

    it('desasigna las tareas de la categoría borrada, sin eliminarlas', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-08-25T18:00:00.000Z'));

        setup([
            task({ id: 'a', categoryId: 'cat-1' }),
            task({ id: 'b', categoryId: 'cat-2' }),
            task({ id: 'c', categoryId: 'cat-1' }),
        ]);

        actions$ = of(CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

        const result = await firstValueFrom(effects.unassignDeletedCategory$);

        expect(result).toEqual(TaskActions.unassignCategorySuccess({
            tasks: [
                task({ id: 'a', categoryId: null, updatedAt: '2026-08-25T18:00:00.000Z' }),
                task({ id: 'c', categoryId: null, updatedAt: '2026-08-25T18:00:00.000Z' }),
            ],
        }));

        vi.useRealTimers();
    });

    it('persiste la colección completa, no solo las afectadas', async () => {
        setup([task({ id: 'a', categoryId: 'cat-1' }), task({ id: 'b', categoryId: 'cat-2' })]);

        actions$ = of(CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

        await firstValueFrom(effects.unassignDeletedCategory$);

        const saved = taskService.saveAll.mock.calls[0][0] as ITask[];

        expect(saved).toHaveLength(2);
        expect(saved.find((t) => t.id === 'a')?.categoryId).toBeNull();
        expect(saved.find((t) => t.id === 'b')?.categoryId).toBe('cat-2');
    });

    it('no toca el almacenamiento si ninguna tarea usaba la categoría', async () => {
        setup([task({ id: 'b', categoryId: 'cat-2' })]);

        actions$ = of(CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

        const emissions: unknown[] = [];
        effects.unassignDeletedCategory$.subscribe((action) => emissions.push(action));

        expect(emissions).toEqual([]);
        expect(taskService.saveAll).not.toHaveBeenCalled();
    });

    it('reporta el fallo si no se puede guardar', async () => {
        setup([task({ id: 'a', categoryId: 'cat-1' })]);
        taskService.saveAll.mockReturnValue(throwError(() => new Error('disco lleno')));

        actions$ = of(CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

        await expect(firstValueFrom(effects.unassignDeletedCategory$))
            .resolves.toEqual(TaskActions.unassignCategoryFailure({ error: 'disco lleno' }));
    });
});
