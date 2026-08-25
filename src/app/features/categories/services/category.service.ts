import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

import { defer, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import { CATEGORIES_FEATURE_KEY } from '../models/category.const';

import type { ICategory } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private storage = inject(Storage);

  private readonly ready$: Observable<Storage> = defer(async () => {
    try {
      await this.storage.defineDriver(CordovaSQLiteDriver);
    } catch { }

    return this.storage.create();
  }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getAll(): Observable<ICategory[]> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.get(CATEGORIES_FEATURE_KEY) as Promise<ICategory[] | null>)),
      map((categories) => categories ?? [])
    );
  }

  saveAll(categories: ICategory[]): Observable<void> {
    return this.ready$.pipe(
      switchMap((storage) => from(storage.set(CATEGORIES_FEATURE_KEY, categories))),
      map(() => undefined)
    );
  }
}
