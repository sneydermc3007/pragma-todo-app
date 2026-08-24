import { createFeatureSelector, createSelector } from '@ngrx/store';

import { taskAdapter, type ITaskState } from './task.reducer';

export const selectTaskState = createFeatureSelector<ITaskState>('tasks');

export const {
    selectAll: selectAllTasks,
    selectEntities: selectTaskEntities,
    selectTotal: selectTaskCount
} = taskAdapter.getSelectors(selectTaskState);

export const selectLoading = createSelector(selectTaskState, (state) => state.loading);

export const selectError = createSelector(selectTaskState, (state) => state.error);

export const selectTaskById = (id: string) =>
    createSelector(selectTaskEntities, (entities) => entities[id]);

export const selectCompletedTasks = createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.completed)
);

export const selectPendingTasks = createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => !task.completed)
);
