import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';

import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';

import { taskReducer } from './app/store/tasks/task.reducer';
import { TaskEffects } from './app/store/tasks/task.effects';
import { provideZoneChangeDetection } from '@angular/core';

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
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});

