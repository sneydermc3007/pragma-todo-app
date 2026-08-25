import { createFeatureSelector, createSelector } from '@ngrx/store';

import { taskAdapter, type ITaskState } from './task.reducer';

import { TASKS_FEATURE_KEY } from '../models/task.const';
import type { ITask } from '../models/task.model';

import { monthKey, todayKey } from '../../../core/utils/date';

export const selectTaskState = createFeatureSelector<ITaskState>(TASKS_FEATURE_KEY);

export const {
    selectAll: selectAllTasks,
    selectEntities: selectTaskEntities,
    selectTotal: selectTaskCount
} = taskAdapter.getSelectors(selectTaskState);

export const selectLoading = createSelector(selectTaskState, (state) => state.loading);

export const selectError = createSelector(selectTaskState, (state) => state.error);

export const selectSearchTerm = createSelector(selectTaskState, (state) => state.searchTerm);

export const selectActiveCategoryId = createSelector(selectTaskState, (state) => state.activeCategoryId);

export const selectTaskById = (id: string) =>
    createSelector(selectTaskEntities, (entities) => entities[id]);

export const UNCATEGORIZED = '__none__';

export const selectVisibleTasks = createSelector(
    selectAllTasks,
    selectSearchTerm,
    selectActiveCategoryId,
    (tasks, term, categoryId) => {
        const needle = term.trim().toLowerCase();

        return tasks.filter((task) => {
            const matchesTerm =
                !needle ||
                task.title.toLowerCase().includes(needle) ||
                (task.description?.toLowerCase().includes(needle) ?? false);

            const matchesCategory =
                categoryId === null ||
                (categoryId === UNCATEGORIZED ? task.categoryId === null : task.categoryId === categoryId);

            return matchesTerm && matchesCategory;
        });
    }
);

export const selectTaskCountByCategory = createSelector(selectAllTasks, (tasks) =>
    tasks.reduce<Record<string, number>>((counts, task) => {
        const key = task.categoryId ?? UNCATEGORIZED;
        counts[key] = (counts[key] ?? 0) + 1;

        return counts;
    }, {})
);

export const selectTasksByCategoryId = (categoryId: string) =>
    createSelector(selectAllTasks, (tasks) => tasks.filter((task) => task.categoryId === categoryId));

const byStartTime = (tasks: readonly ITask[]): ITask[] =>
    tasks.slice().sort((a, b) => (a.startTime ?? '99:99').localeCompare(b.startTime ?? '99:99'));

export const tasksOfDay = (tasks: readonly ITask[], dateKey: string): ITask[] =>
    byStartTime(tasks.filter((task) => task.scheduledDate === dateKey));

export const selectTodayTasks = createSelector(selectVisibleTasks, (tasks) =>
    tasksOfDay(tasks, todayKey())
);

export const selectMonthTaskCount = createSelector(selectAllTasks, (tasks) => {
    const currentMonth = monthKey(todayKey());

    return tasks.filter((task) => monthKey(task.scheduledDate) === currentMonth).length;
});

export const selectPendingTasks = createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => !task.completed)
);

export const selectCompletedTasks = createSelector(selectAllTasks, (tasks) =>
    tasks.filter((task) => task.completed)
);

export const selectOverdueTasks = createSelector(selectPendingTasks, (tasks) =>
    tasks.filter((task) => task.scheduledDate < todayKey())
);

export const selectUpcomingTasks = createSelector(selectPendingTasks, (tasks) =>
    tasks
        .filter((task) => task.scheduledDate >= todayKey())
        .slice()
        .sort((a, b) =>
            `${a.scheduledDate}${a.startTime ?? '99:99'}`.localeCompare(
                `${b.scheduledDate}${b.startTime ?? '99:99'}`
            )
        )
);
