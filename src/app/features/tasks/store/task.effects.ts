import { inject, Injectable } from '@angular/core';

import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { catchError, concatMap, filter, map, of, switchMap } from 'rxjs';

import { TaskActions } from './task.actions';
import { CategoryActions } from '../../categories/store/category.actions';
import { selectAllTasks, selectTaskById } from './task.selectors';

import type { ITask } from '../models/task.model';

import { TaskService } from '../services/task.service';

import { newId } from '../../../core/utils/id';

@Injectable()
export class TaskEffects {
    private actions$: Actions = inject(Actions);
    private store: Store = inject(Store);
    private taskService: TaskService = inject(TaskService);

    loadTasks$ = createEffect(() => this.actions$.pipe(
        ofType(TaskActions.loadTasks),
        switchMap(() => this.taskService.getAll().pipe(
            map((tasks) => TaskActions.loadTasksSuccess({ tasks })),
            catchError((error: Error) => of(TaskActions.loadTasksFailure({ error: error.message })))
        ))
    ));

    addTask$ = createEffect(() => this.actions$.pipe(
        ofType(TaskActions.addTask),
        concatLatestFrom(() => this.store.select(selectAllTasks)),
        concatMap(([{ task }, tasks]) => {
            const now = new Date().toISOString();
            const created: ITask = {
                ...task,
                id: newId(),
                completed: false,
                createdAt: now,
                updatedAt: now
            };

            return this.taskService.saveAll([created, ...tasks]).pipe(
                map(() => TaskActions.addTaskSuccess({ task: created })),
                catchError((error: Error) => of(TaskActions.addTaskFailure({ error: error.message })))
            );
        })
    ));

    updateTask$ = createEffect(() => this.actions$.pipe(
        ofType(TaskActions.updateTask),
        concatLatestFrom(({ id }) => [
            this.store.select(selectTaskById(id)),
            this.store.select(selectAllTasks)
        ]),
        filter(([, current]) => !!current),
        concatMap(([{ changes }, current, tasks]) => {
            const updated: ITask = {
                ...current!,
                ...changes,
                updatedAt: new Date().toISOString()
            };

            return this.taskService.saveAll(tasks.map((task) => (task.id === updated.id ? updated : task))).pipe(
                map(() => TaskActions.updateTaskSuccess({ task: updated })),
                catchError((error: Error) => of(TaskActions.updateTaskFailure({ error: error.message })))
            );
        })
    ));

    deleteTask$ = createEffect(() => this.actions$.pipe(
        ofType(TaskActions.deleteTask),
        concatLatestFrom(() => this.store.select(selectAllTasks)),
        concatMap(([{ id }, tasks]) =>
            this.taskService.saveAll(tasks.filter((task) => task.id !== id)).pipe(
                map(() => TaskActions.deleteTaskSuccess({ id })),
                catchError((error: Error) => of(TaskActions.deleteTaskFailure({ error: error.message })))
            )
        )
    ));

    unassignDeletedCategory$ = createEffect(() => this.actions$.pipe(
        ofType(CategoryActions.deleteCategorySuccess),
        concatLatestFrom(() => this.store.select(selectAllTasks)),
        filter(([{ id }, tasks]) => tasks.some((task) => task.categoryId === id)),
        concatMap(([{ id }, tasks]) => {
            const now = new Date().toISOString();

            const unassigned = tasks
                .filter((task) => task.categoryId === id)
                .map((task) => ({ ...task, categoryId: null, updatedAt: now }));

            const next = tasks.map(
                (task) => unassigned.find((updated) => updated.id === task.id) ?? task
            );

            return this.taskService.saveAll(next).pipe(
                map(() => TaskActions.unassignCategorySuccess({ tasks: unassigned })),
                catchError((error: Error) =>
                    of(TaskActions.unassignCategoryFailure({ error: error.message })))
            );
        })
    ));

    toggleTask$ = createEffect(() => this.actions$.pipe(
        ofType(TaskActions.toggleTask),
        concatLatestFrom(({ id }) => this.store.select(selectTaskById(id))),
        filter(([, task]) => !!task),
        map(([{ id }, task]) => TaskActions.updateTask({
            id,
            changes: { completed: !task!.completed }
        }))
    ));
}
