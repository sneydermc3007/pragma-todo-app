import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';


import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectActiveCategoryId, selectError, selectMonthTaskCount, selectSearchTerm, selectTaskCountByCategory, selectTodayTasks, selectVisibleTasks } from '../../store/task.selectors';
import { selectAllCategories, selectCategoryEntities } from '../../../categories/store/category.selectors';
import { TaskFormService } from '../../services/task-form.service';

import { TaskListComponent } from './task-list.component';



describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let taskForm: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    taskForm = { open: vi.fn().mockResolvedValue(undefined) };

    TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        provideRouter([]),
        { provide: TaskFormService, useValue: taskForm },
        provideMockStore({
          selectors: [
            { selector: selectVisibleTasks, value: [] },
            { selector: selectTodayTasks, value: [] },
            { selector: selectMonthTaskCount, value: 0 },
            { selector: selectSearchTerm, value: '' },
            { selector: selectError, value: null },
            { selector: selectActiveCategoryId, value: null },
            { selector: selectTaskCountByCategory, value: {} },
            { selector: selectAllCategories, value: [] },
            { selector: selectCategoryEntities, value: {} },
          ],
        }),
      ],
    });

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    dispatch = vi.spyOn(store, 'dispatch');

    await fixture.whenStable();
  });

  it('se crea', () => {
    expect(component).toBeTruthy();
  });

  it('pide la carga de tareas al inicializarse', () => {
    expect(dispatch).toHaveBeenCalledWith(TaskActions.loadTasks());
  });

  describe('saludo según la hora', () => {
    const greetingKeyAt = (hour: number): string => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 7, 23, hour, 0, 0));

      const local = TestBed.createComponent(TaskListComponent).componentInstance;
      const greeting = local.greetingKey();

      vi.useRealTimers();

      return greeting;
    };

    it('usa la clave de la mañana antes del mediodía', () => {
      expect(greetingKeyAt(9)).toBe('greeting.morning');
    });

    it('usa la clave de la tarde entre las 12 y las 19', () => {
      expect(greetingKeyAt(15)).toBe('greeting.afternoon');
    });

    it('usa la clave de la noche desde las 19', () => {
      expect(greetingKeyAt(21)).toBe('greeting.evening');
    });
  });

  describe('hasActiveFilters', () => {
    it('es falso sin término ni categoría', () => {
      expect(component.hasActiveFilters()).toBe(false);
    });

    it('es verdadero con un término escrito', () => {
      store.overrideSelector(selectSearchTerm, 'café');
      store.refreshState();

      expect(component.hasActiveFilters()).toBe(true);
    });

    it('ignora un término de solo espacios', () => {
      store.overrideSelector(selectSearchTerm, '   ');
      store.refreshState();

      expect(component.hasActiveFilters()).toBe(false);
    });

    it('es verdadero con una categoría activa', () => {
      store.overrideSelector(selectActiveCategoryId, 'cat-1');
      store.refreshState();

      expect(component.hasActiveFilters()).toBe(true);
    });
  });

  describe('headlineKey', () => {
    it('usa el singular con una sola tarea', () => {
      store.overrideSelector(selectMonthTaskCount, 1);
      store.refreshState();

      expect(component.headlineKey()).toBe('home.headline.one');
    });

    it('usa el plural con cero o varias', () => {
      expect(component.headlineKey()).toBe('home.headline.other');
    });
  });

  describe('búsqueda', () => {
    it('despacha setSearchTerm con el término escrito', () => {
      component.search('café');

      expect(dispatch).toHaveBeenCalledWith(TaskActions.setSearchTerm({ term: 'café' }));
    });

    it('traduce null a cadena vacía cuando se limpia el buscador', () => {
      component.search(null);

      expect(dispatch).toHaveBeenCalledWith(TaskActions.setSearchTerm({ term: '' }));
    });
  });

  describe('formulario', () => {
    it('abre el formulario vacío para crear', () => {
      component.openForm();

      expect(taskForm.open).toHaveBeenCalledWith(null);
    });

    it('abre el formulario con la tarea para editar', () => {
      const task = { id: 'task-1' } as never;

      component.openForm(task);

      expect(taskForm.open).toHaveBeenCalledWith(task);
    });
  });

  it('toggle despacha toggleTask', () => {
    component.toggle('task-1');

    expect(dispatch).toHaveBeenCalledWith(TaskActions.toggleTask({ id: 'task-1' }));
  });

  it('remove despacha deleteTask', () => {
    component.remove('task-1');

    expect(dispatch).toHaveBeenCalledWith(TaskActions.deleteTask({ id: 'task-1' }));
  });
});
