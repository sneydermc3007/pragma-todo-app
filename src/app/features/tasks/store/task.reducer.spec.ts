import { initialState, taskReducer } from './task.reducer';
import { TaskActions } from './task.actions';
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

describe('taskReducer', () => {
    describe('carga', () => {
        it('marca loading y limpia el error anterior al pedir la carga', () => {
            const state = taskReducer(
                { ...initialState, error: 'sin acceso' },
                TaskActions.loadTasks()
            );

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('reemplaza la colección completa con loadTasksSuccess', () => {
            const conDatos = taskReducer(initialState, TaskActions.loadTasksSuccess({ tasks: [task()] }));
            const state = taskReducer(
                conDatos,
                TaskActions.loadTasksSuccess({ tasks: [task({ id: 'task-2' })] })
            );

            expect(state.ids).toEqual(['task-2']);
            expect(state.loading).toBe(false);
        });
    });

    describe('alta, edición y borrado', () => {
        it('agrega una tarea con addTaskSuccess', () => {
            const state = taskReducer(initialState, TaskActions.addTaskSuccess({ task: task() }));

            expect(state.entities['task-1']?.title).toBe('Comprar café');
            expect(state.entities['task-1']?.completed).toBe(false);
            expect(state.loading).toBe(false);
        });

        it('reemplaza la tarea con updateTaskSuccess', () => {
            let state = taskReducer(initialState, TaskActions.addTaskSuccess({ task: task() }));
            state = taskReducer(state, TaskActions.updateTaskSuccess({
                task: task({ completed: true, updatedAt: '2026-08-25T11:00:00.000Z' }),
            }));

            expect(state.ids).toEqual(['task-1']);
            expect(state.entities['task-1']?.completed).toBe(true);
            expect(state.entities['task-1']?.updatedAt).toBe('2026-08-25T11:00:00.000Z');
        });

        it('elimina la tarea con deleteTaskSuccess', () => {
            let state = taskReducer(initialState, TaskActions.addTaskSuccess({ task: task() }));
            state = taskReducer(state, TaskActions.deleteTaskSuccess({ id: 'task-1' }));

            expect(state.ids).toEqual([]);
            expect(state.entities['task-1']).toBeUndefined();
        });
    });

    describe('errores', () => {
        it('guarda el mensaje y apaga loading en cada Failure', () => {
            const failures = [
                TaskActions.loadTasksFailure({ error: 'sin acceso' }),
                TaskActions.addTaskFailure({ error: 'disco lleno' }),
                TaskActions.updateTaskFailure({ error: 'conflicto' }),
                TaskActions.deleteTaskFailure({ error: 'no existe' }),
            ];

            for (const failure of failures) {
                const state = taskReducer({ ...initialState, loading: true }, failure);

                expect(state.error).toBe(failure.error);
                expect(state.loading).toBe(false);
            }
        });

        it('un Failure no toca las tareas que ya estaban', () => {
            const conDatos = taskReducer(initialState, TaskActions.addTaskSuccess({ task: task() }));
            const state = taskReducer(conDatos, TaskActions.deleteTaskFailure({ error: 'no existe' }));

            expect(state.ids).toEqual(['task-1']);
        });
    });

    describe('orden', () => {
        it('ordena por fecha de creación descendente', () => {
            const state = taskReducer(initialState, TaskActions.loadTasksSuccess({
                tasks: [
                    task({ id: 'vieja', createdAt: '2026-08-01T10:00:00.000Z' }),
                    task({ id: 'nueva', createdAt: '2026-08-23T10:00:00.000Z' }),
                ],
            }));

            expect(state.ids).toEqual(['nueva', 'vieja']);
        });

        it('ubica la tarea nueva según su fecha, no al final', () => {
            let state = taskReducer(initialState, TaskActions.loadTasksSuccess({
                tasks: [task({ id: 'nueva', createdAt: '2026-08-23T10:00:00.000Z' })],
            }));
            state = taskReducer(state, TaskActions.addTaskSuccess({
                task: task({ id: 'vieja', createdAt: '2026-08-01T10:00:00.000Z' }),
            }));

            expect(state.ids).toEqual(['nueva', 'vieja']);
        });

        it('con la misma fecha de creación conserva el orden en que llegaron', () => {
            const state = taskReducer(initialState, TaskActions.loadTasksSuccess({
                tasks: [
                    task({ id: 'primera' }),
                    task({ id: 'segunda' }),
                    task({ id: 'tercera' }),
                ],
            }));

            expect(state.ids).toEqual(['primera', 'segunda', 'tercera']);
        });
    });

    describe('filtros', () => {
        it('guarda el término de búsqueda', () => {
            const state = taskReducer(initialState, TaskActions.setSearchTerm({ term: 'café' }));

            expect(state.searchTerm).toBe('café');
        });

        it('guarda la categoría activa y acepta null para quitarla', () => {
            const filtrado = taskReducer(
                initialState,
                TaskActions.setActiveCategory({ categoryId: 'cat-1' })
            );

            expect(filtrado.activeCategoryId).toBe('cat-1');
            expect(
                taskReducer(filtrado, TaskActions.setActiveCategory({ categoryId: null })).activeCategoryId
            ).toBeNull();
        });

        it('los filtros no tocan loading ni error', () => {
            const state = taskReducer(
                { ...initialState, loading: true, error: 'sin acceso' },
                TaskActions.setSearchTerm({ term: 'café' })
            );

            expect(state.loading).toBe(true);
            expect(state.error).toBe('sin acceso');
        });
    });

    describe('categoría borrada', () => {
        it('desasigna las tareas en lugar de eliminarlas', () => {
            const conDatos = taskReducer(initialState, TaskActions.loadTasksSuccess({
                tasks: [task({ id: 'task-1' }), task({ id: 'task-2', categoryId: 'cat-2' })],
            }));

            const state = taskReducer(conDatos, TaskActions.unassignCategorySuccess({
                tasks: [task({ id: 'task-1', categoryId: null })],
            }));

            expect(state.ids).toEqual(['task-1', 'task-2']);
            expect(state.entities['task-1']?.categoryId).toBeNull();
            expect(state.entities['task-2']?.categoryId).toBe('cat-2');
        });
    });

    it('no muta el estado anterior', () => {
        const before = taskReducer(initialState, TaskActions.addTaskSuccess({ task: task() }));
        const after = taskReducer(before, TaskActions.deleteTaskSuccess({ id: 'task-1' }));

        expect(before.ids).toEqual(['task-1']);
        expect(before.entities['task-1']).toBeDefined();
        expect(after).not.toBe(before);
    });
});
