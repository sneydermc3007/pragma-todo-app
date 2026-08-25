import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
