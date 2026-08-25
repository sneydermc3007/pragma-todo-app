import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertController, ModalController } from '@ionic/angular';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { CategoryListComponent } from './category-list.component';
import { CategoryActions } from '../../store/category.actions';
import { selectAllCategories, selectCategoryNames } from '../../store/category.selectors';
import { TaskActions } from '../../../tasks/store/task.actions';
import { selectTaskCountByCategory } from '../../../tasks/store/task.selectors';

import type { ICategory } from '../../models/category.model';

const category = (overrides: Partial<ICategory> = {}): ICategory => ({
  id: 'cat-1',
  name: 'Trabajo',
  color: '#3498db',
  createdAt: '2026-08-25T10:00:00.000Z',
  ...overrides,
});

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let modalCtrl: { create: ReturnType<typeof vi.fn> };
  let modal: { present: ReturnType<typeof vi.fn>; onWillDismiss: ReturnType<typeof vi.fn> };
  let alertCtrl: { create: ReturnType<typeof vi.fn> };
  let alert: { present: ReturnType<typeof vi.fn>; onWillDismiss: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    modal = {
      present: vi.fn().mockResolvedValue(undefined),
      onWillDismiss: vi.fn().mockResolvedValue({ data: { name: 'Compras', color: '#e74c3c' }, role: 'confirm' }),
    };
    modalCtrl = { create: vi.fn().mockResolvedValue(modal) };

    alert = {
      present: vi.fn().mockResolvedValue(undefined),
      onWillDismiss: vi.fn().mockResolvedValue({ role: 'destructive' }),
    };
    alertCtrl = { create: vi.fn().mockResolvedValue(alert) };

    TestBed.configureTestingModule({
      imports: [CategoryListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalController, useValue: modalCtrl },
        { provide: AlertController, useValue: alertCtrl },
        provideMockStore({
          selectors: [
            { selector: selectAllCategories, value: [category()] },
            { selector: selectCategoryNames, value: ['Trabajo'] },
            { selector: selectTaskCountByCategory, value: { 'cat-1': 3 } },
          ],
        }),
      ],
    });

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    dispatch = vi.spyOn(store, 'dispatch');

    await fixture.whenStable();
  });

  it('pide categorías y tareas al inicializarse', () => {
    expect(dispatch).toHaveBeenCalledWith(CategoryActions.loadCategories());
    expect(dispatch).toHaveBeenCalledWith(TaskActions.loadTasks());
  });

  describe('contador', () => {
    it('devuelve las tareas de la categoría', () => {
      expect(component.countFor(category())).toBe(3);
    });

    it('devuelve cero si la categoría no tiene tareas', () => {
      expect(component.countFor(category({ id: 'cat-9' }))).toBe(0);
    });
  });

  it('crear despacha addCategory con lo que devuelve el modal', async () => {
    await component.create();

    expect(dispatch).toHaveBeenCalledWith(
      CategoryActions.addCategory({ category: { name: 'Compras', color: '#e74c3c' } })
    );
  });

  it('crear no despacha nada si se cancela', async () => {
    modal.onWillDismiss.mockResolvedValue({ data: null, role: 'cancel' });
    dispatch.mockClear();

    await component.create();

    expect(dispatch).not.toHaveBeenCalled();
  });

  it('editar pasa la categoría al modal y despacha updateCategory', async () => {
    await component.edit(category());

    expect(modalCtrl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        componentProps: { category: category(), takenNames: ['Trabajo'] },
      })
    );
    expect(dispatch).toHaveBeenCalledWith(
      CategoryActions.updateCategory({ id: 'cat-1', changes: { name: 'Compras', color: '#e74c3c' } })
    );
  });

  describe('eliminar', () => {
    it('avisa cuántas tareas quedan sin categoría', async () => {
      await component.remove(category());

      expect(alertCtrl.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '3 tareas van a quedar sin categoría. Las tareas no se borran.',
        })
      );
      expect(dispatch).toHaveBeenCalledWith(CategoryActions.deleteCategory({ id: 'cat-1' }));
    });

    it('usa el singular cuando es una sola tarea', async () => {
      store.overrideSelector(selectTaskCountByCategory, { 'cat-1': 1 });
      store.refreshState();
      await fixture.whenStable();

      await component.remove(category());

      expect(alertCtrl.create).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '1 tarea va a quedar sin categoría. Las tareas no se borran.',
        })
      );
    });

    it('avisa cuando ninguna tarea la usa', async () => {
      await component.remove(category({ id: 'cat-9' }));

      expect(alertCtrl.create).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Ninguna tarea usa esta categoría.' })
      );
    });

    it('no borra nada si se cancela', async () => {
      alert.onWillDismiss.mockResolvedValue({ role: 'cancel' });
      dispatch.mockClear();

      await component.remove(category());

      expect(dispatch).not.toHaveBeenCalled();
    });
  });
});
