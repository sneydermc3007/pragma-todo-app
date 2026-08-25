import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';


import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectActiveCategoryId, selectError, selectMonthTaskCount, selectSearchTerm, selectTaskCountByCategory, selectTodayTasks, selectVisibleTasks } from '../../store/task.selectors';
import { selectAllCategories, selectCategoryEntities } from '../../../categories/store/category.selectors';
import { selectUse24hClock } from '../../../remote-config/store/remote-config.selectors';
import { TaskFormService } from '../../services/task-form.service';
import { TaskFeedbackService } from '../../services/task-feedback.service';

import { TaskListComponent } from './task-list.component';



describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let taskForm: { open: ReturnType<typeof vi.fn> };
  let feedback: { confirmDelete: ReturnType<typeof vi.fn>; notify: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    taskForm = { open: vi.fn().mockResolvedValue(undefined) };
    feedback = {
      confirmDelete: vi.fn().mockResolvedValue(true),
      notify: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        provideRouter([]),
        { provide: TaskFormService, useValue: taskForm },
        { provide: TaskFeedbackService, useValue: feedback },
        provideMockStore({
          selectors: [
            { selector: selectUse24hClock, value: false },
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

  describe('trackById', () => {
    it('identifica cada tarea por su id', () => {
      const task = { id: 'task-7' } as never;

      expect(component.trackById(0, task)).toBe('task-7');
    });
  });

  describe('posición del scroll al cambiar de pantalla', () => {
    const scrollableTop = (): { get: () => number; set: (value: number) => void } => {
      const scroller = fixture.nativeElement.querySelector('.scroller') as HTMLElement;
      let top = 0;

      Object.defineProperty(scroller, 'scrollTop', {
        configurable: true,
        get: () => top,
        set: (value: number) => { top = value; },
      });

      return { get: () => top, set: (value: number) => { top = value; } };
    };

    it('restaura el desplazamiento que tenía al salir', () => {
      const scrollTop = scrollableTop();

      scrollTop.set(1200);
      component.ionViewWillLeave();

      scrollTop.set(0);
      component.ionViewDidEnter();

      expect(scrollTop.get()).toBe(1200);
    });

    it('vuelve a medir el viewport al entrar, porque estaba oculto', () => {
      scrollableTop();

      const viewport = fixture.debugElement
        .query(By.directive(CdkVirtualScrollViewport))
        .injector.get(CdkVirtualScrollViewport);
      const checkViewportSize = vi.spyOn(viewport, 'checkViewportSize');

      component.ionViewDidEnter();

      expect(checkViewportSize).toHaveBeenCalled();
    });
  });

  it('toggle despacha toggleTask', () => {
    component.toggle('task-1');

    expect(dispatch).toHaveBeenCalledWith(TaskActions.toggleTask({ id: 'task-1' }));
  });

  describe('remove', () => {
    const task = { id: 'task-1', title: 'Comprar café' } as never;

    it('pide confirmación antes de borrar', async () => {
      await component.remove(task);

      expect(feedback.confirmDelete).toHaveBeenCalledWith('Comprar café');
      expect(dispatch).toHaveBeenCalledWith(TaskActions.deleteTask({ id: 'task-1' }));
      expect(feedback.notify).toHaveBeenCalledWith('toast.taskDeleted');
    });

    it('no borra nada si se cancela', async () => {
      feedback.confirmDelete.mockResolvedValue(false);
      dispatch.mockClear();

      await component.remove(task);

      expect(dispatch).not.toHaveBeenCalled();
      expect(feedback.notify).not.toHaveBeenCalled();
    });
  });
});
