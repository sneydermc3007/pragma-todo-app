import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';

import { catchError, concatMap, filter, map, of, switchMap } from 'rxjs';

import { TaskActions } from './task.actions';
import { selectAllTasks, selectTaskById } from './task.selectors';

import type { ITask } from '../../core/models/task.model';
import { newId } from '../../core/utils/id';
import { TaskService } from '../../core/services/task';

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
