import { ETaskPriority } from "../enum/task.enum";

export interface ITask {
    id: string;
    title: string;
    description: string | null;
    priority: ETaskPriority;
    completed: boolean;
    createdAt: string;
    updatedAt: string;
}

export type TAddTaskPayload = Pick<ITask, 'title' | 'description' | 'priority'>;

export type TUpdateTaskPayload = {
  id: string;
  changes: Partial<Pick<ITask, 'title' | 'description' | 'priority' | 'completed'>>;
};