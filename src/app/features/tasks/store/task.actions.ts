import { createActionGroup, props, emptyProps } from '@ngrx/store';

import type { ITask, TAddTaskPayload, TUpdateTaskPayload } from '../models/task.model';

export const TaskActions = createActionGroup({
    source: 'Task',
    events: {
        'Load Tasks': emptyProps(),
        'Load Tasks Success': props<{ tasks: ITask[] }>(),
        'Load Tasks Failure': props<{ error: string }>(),

        'Add Task': props<{ task: TAddTaskPayload }>(),
        'Add Task Success': props<{ task: ITask }>(),
        'Add Task Failure': props<{ error: string }>(),

        'Update Task': props<TUpdateTaskPayload>(),
        'Update Task Success': props<{ task: ITask }>(),
        'Update Task Failure': props<{ error: string }>(),

        'Delete Task': props<{ id: string }>(),
        'Delete Task Success': props<{ id: string }>(),
        'Delete Task Failure': props<{ error: string }>(),

        'Toggle Task': props<{ id: string }>(),

        'Set Search Term': props<{ term: string }>()
    }
})
