import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withComponentInputBinding, withPreloading, PreloadAllModules } from '@angular/router';

import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { AppComponent } from './app/app.component';

import { routes } from './app/app.routes';
import { registerAppIcons } from './app/core/icons';
import { CATEGORIES_FEATURE_KEY } from './app/features/categories/models/category.const';
import { categoryReducer } from './app/features/categories/store/category.reducer';
import { CategoryEffects } from './app/features/categories/store/category.effects';


registerAppIcons();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideZonelessChangeDetection(),
    provideStore({}, {
      runtimeChecks: { strictStateSerializability: true, strictActionSerializability: true },
    }),
    provideState({ name: CATEGORIES_FEATURE_KEY, reducer: categoryReducer }),
    provideEffects(CategoryEffects),
    provideStoreDevtools({ maxAge: 25 }),
    provideIonicAngular({ useSetInputAPI: true }),
    importProvidersFrom(IonicStorageModule.forRoot({
      name: 'todoDb',
      storeName: 'tasks',
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage],
    })),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});

