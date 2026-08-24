import { ETaskPriority } from './task.enum';

export interface ITask {
    id: string;
    title: string;
    description: string | null;
    priority: ETaskPriority;
    completed: boolean;
    scheduledDate: string;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    updatedAt: string;
}

export type TAddTaskPayload = Pick<
    ITask,
    'title' | 'description' | 'priority' | 'scheduledDate' | 'startTime' | 'endTime'
>;

export type TUpdateTaskPayload = {
    id: string;
    changes: Partial<Pick<
        ITask,
        'title' | 'description' | 'priority' | 'completed' | 'scheduledDate' | 'startTime' | 'endTime'
    >>;
};
