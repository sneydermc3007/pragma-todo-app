import { Routes } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { taskReducer } from './store/task.reducer';
import { TaskEffects } from './store/task.effects';

import { TASKS_FEATURE_KEY } from './models/task.const';

export const TASKS_ROUTES: Routes = [
  {
    path: '',
    providers: [
      provideState({ name: TASKS_FEATURE_KEY, reducer: taskReducer }),
      provideEffects(TaskEffects),
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/task-list/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/task-agenda/task-agenda.component').then((m) => m.TaskAgendaComponent),
      },
      {
        path: 'alerts',
        loadComponent: () => import('./pages/task-alerts/task-alerts.component').then((m) => m.TaskAlertsComponent),
      },
    ],
  },
];
