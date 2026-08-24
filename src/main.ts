import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';

import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';

import { taskReducer } from './app/store/tasks/task.reducer';
import { TaskEffects } from './app/store/tasks/task.effects';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideEffects(TaskEffects),
    provideStore({ tasks: taskReducer }, {
      runtimeChecks: { strictStateSerializability: true, strictActionSerializability: true },
    }),
    provideStoreDevtools({ maxAge: 25, connectInZone: true }),  
    provideIonicAngular(),
    importProvidersFrom(IonicStorageModule.forRoot({
      name: 'todoDb',
      storeName: 'tasks',
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage],
    })),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});

