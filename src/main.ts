import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localeEs from '@angular/common/locales/es';
import localeEn from '@angular/common/locales/en';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
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
import { detectLanguage, FALLBACK_LANGUAGE } from './app/core/i18n';
import { initializeFirebase } from './app/core/firebase';
import { REMOTE_CONFIG_FEATURE_KEY } from './app/features/remote-config/models/remote-config.const';
import { remoteConfigReducer } from './app/features/remote-config/store/remote-config.reducer';
import { RemoteConfigEffects } from './app/features/remote-config/store/remote-config.effects';
import { CATEGORIES_FEATURE_KEY } from './app/features/categories/models/category.const';
import { categoryReducer } from './app/features/categories/store/category.reducer';
import { CategoryEffects } from './app/features/categories/store/category.effects';


registerLocaleData(localeEs, 'es');
registerLocaleData(localeEn, 'en');

const language = detectLanguage();

registerAppIcons();
initializeFirebase();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: language },
    provideHttpClient(),
    provideTranslateService({
      lang: language,
      fallbackLang: FALLBACK_LANGUAGE,
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix: '.json' }),
    }),
    provideZonelessChangeDetection(),
    provideStore({}, {
      runtimeChecks: { strictStateSerializability: true, strictActionSerializability: true },
    }),
    provideState({ name: CATEGORIES_FEATURE_KEY, reducer: categoryReducer }),
    provideEffects(CategoryEffects),
    provideState({ name: REMOTE_CONFIG_FEATURE_KEY, reducer: remoteConfigReducer }),
    provideEffects(RemoteConfigEffects),
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

