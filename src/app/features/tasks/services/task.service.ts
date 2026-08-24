import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { defer, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import { TASKS_FEATURE_KEY } from '../models/task.const';

import type { ITask } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storage = inject(Storage);

  private readonly ready$: Observable<Storage> = defer(async () => {
    try {
      await this.storage.defineDriver(CordovaSQLiteDriver);
    } catch { }

    return this.storage.create();
  }).pipe(
    shareReplay({ bufferSize: 1, refCount: false })
  );

  getAll(): Observable<ITask[]> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.get(TASKS_FEATURE_KEY) as Promise<ITask[] | null>)),
      map((tasks) => (tasks ?? []).map(migrate))
    );
  }

  saveAll(tasks: ITask[]): Observable<void> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.set(TASKS_FEATURE_KEY, tasks))),
      map(() => undefined)
    );
  }

  get driver(): string | null {
    return this.storage.driver;
  }
}

const migrate = (task: ITask): ITask => ({
  ...task,
  scheduledDate: task.scheduledDate ?? task.createdAt.slice(0, 10),
  startTime: task.startTime ?? null,
  endTime: task.endTime ?? null,
});
