import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { AppComponent } from './app.component';
import { RemoteConfigActions } from './features/remote-config/store/remote-config.actions';
import { selectDarkModeEnabled } from './features/remote-config/store/remote-config.selectors';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        provideRouter([]),
        provideMockStore({ selectors: [{ selector: selectDarkModeEnabled, value: false }] }),
      ],
    });

    fixture = TestBed.createComponent(AppComponent);
    store = TestBed.inject(MockStore);

    dispatch = vi.spyOn(store, 'dispatch');

    await fixture.whenStable();
  });

  afterEach(() => {
    document.documentElement.classList.remove('ion-palette-dark');
  });

  it('se crea', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('pide los feature flags al inicializarse', () => {
    expect(dispatch).toHaveBeenCalledWith(RemoteConfigActions.loadFlags());
  });

  describe('tema oscuro', () => {
    it('no aplica la paleta oscura con el flag apagado', () => {
      expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
    });

    it('aplica la paleta oscura cuando el flag se enciende', async () => {
      store.overrideSelector(selectDarkModeEnabled, true);
      store.refreshState();
      await fixture.whenStable();

      expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(true);
    });

    it('la quita cuando el flag se apaga de nuevo', async () => {
      store.overrideSelector(selectDarkModeEnabled, true);
      store.refreshState();
      await fixture.whenStable();

      store.overrideSelector(selectDarkModeEnabled, false);
      store.refreshState();
      await fixture.whenStable();

      expect(document.documentElement.classList.contains('ion-palette-dark')).toBe(false);
    });
  });
});
