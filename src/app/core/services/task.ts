import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { defer, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import type { ITask } from '../models/task.model';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private storage = inject(Storage);

  private readonly ready$: Observable<Storage> = defer(async () => {
    try {
      await this.storage.defineDriver(CordovaSQLiteDriver);
    } catch {

    }

    return this.storage.create();
  }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getAll(): Observable<ITask[]> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.get(STORAGE_KEY) as Promise<ITask[] | null>)),
      map((tasks) => tasks ?? [])
    );
  }

  saveAll(tasks: ITask[]): Observable<void> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.set(STORAGE_KEY, tasks))),
      map(() => undefined)
    );
  }

  get driver(): string | null {
    return this.storage.driver;
  }
}
