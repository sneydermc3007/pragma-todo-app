import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { TaskActions } from './task.actions';

import type { ITask } from '../models/task.model';

export interface ITaskState extends EntityState<ITask> {
    loading: boolean;
    error: string | null;
    searchTerm: string;
    activeCategoryId: string | null;
}

export const taskAdapter: EntityAdapter<ITask> = createEntityAdapter<ITask>({
    sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt)
});

export const initialState: ITaskState = taskAdapter.getInitialState({
    loading: false,
    error: null,
    searchTerm: '',
    activeCategoryId: null
});

export const taskReducer = createReducer(
    initialState,

    // Load
    on(TaskActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),
    on(TaskActions.loadTasksSuccess, (state, { tasks }) => 
        taskAdapter.setAll(tasks, { ...state, loading: false, error: null })
    ),
    on(TaskActions.loadTasksFailure, (state, { error }) => 
        ({ ...state, loading: false, error })
    ),

    // Add
    on(TaskActions.addTask, (state) => ({ ...state, loading: true, error: null })),
    on(TaskActions.addTaskSuccess, (state, { task }) => 
        taskAdapter.addOne(task, { ...state, loading: false, error: null })
    ),
    on(TaskActions.addTaskFailure, (state, { error }) => 
        ({ ...state, loading: false, error })
    ),

    // Update
    on(TaskActions.updateTask, (state) => ({ ...state, loading: true, error: null })),
    on(TaskActions.updateTaskSuccess, (state, { task }) =>
        taskAdapter.upsertOne(task, { ...state, loading: false, error: null })
    ),
    on(TaskActions.updateTaskFailure, (state, { error }) => ({ ...state, loading: false, error })),

    // Delete
    on(TaskActions.deleteTask, (state) => ({ ...state, loading: true, error: null })),
    on(TaskActions.deleteTaskSuccess, (state, { id }) =>
        taskAdapter.removeOne(id, { ...state, loading: false, error: null })
    ),
    on(TaskActions.deleteTaskFailure, (state, { error }) => ({ ...state, loading: false, error })),

    // Búsqueda
    on(TaskActions.setSearchTerm, (state, { term }) => ({ ...state, searchTerm: term })),
    on(TaskActions.setActiveCategory, (state, { categoryId }) => ({ ...state, activeCategoryId: categoryId })),

    on(TaskActions.unassignCategorySuccess, (state, { tasks }) => taskAdapter.upsertMany(tasks, state)),
    on(TaskActions.unassignCategoryFailure, (state, { error }) => ({ ...state, error }))
);