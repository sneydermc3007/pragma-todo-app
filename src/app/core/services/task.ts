import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import type { ITask } from '../models/task.model';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  getAll(): Observable<ITask[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return of(raw ? (JSON.parse(raw) as ITask[]) : []);
    } catch (error) {
      return throwError(() => new Error('No se pudieron leer las tareas del almacenamiento'));
    }
  }

  saveAll(tasks: ITask[]): Observable<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      return of(void 0);
    } catch (error) {
      return throwError(() => new Error('No se pudieron guardar las tareas'));
    }
  }
}
