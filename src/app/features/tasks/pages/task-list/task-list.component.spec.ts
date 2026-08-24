import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalController } from '@ionic/angular';

import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectError, selectMonthTaskCount, selectSearchTerm, selectTodayTasks, selectVisibleTasks } from '../../store/task.selectors';

import { TaskListComponent } from './task-list.component';

import { ETaskPriority } from '../../models/task.enum';

import type { TAddTaskPayload } from '../../models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let modalCtrl: { create: ReturnType<typeof vi.fn> };
  let modal: { present: ReturnType<typeof vi.fn>; onWillDismiss: ReturnType<typeof vi.fn> };

  const payload: TAddTaskPayload = {
    title: 'Comprar café',
    description: null,
    priority: ETaskPriority.HIGH,
    scheduledDate: '2026-08-23',
    startTime: '10:00',
    endTime: '11:00',
  };

  beforeEach(async () => {
    modal = {
      present: vi.fn().mockResolvedValue(undefined),
      onWillDismiss: vi.fn().mockResolvedValue({ data: payload, role: 'confirm' }),
    };
    modalCtrl = { create: vi.fn().mockResolvedValue(modal) };

    TestBed.configureTestingModule({
      imports: [TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ModalController, useValue: modalCtrl },
        provideMockStore({
          selectors: [
            { selector: selectVisibleTasks, value: [] },
            { selector: selectTodayTasks, value: [] },
            { selector: selectMonthTaskCount, value: 0 },
            { selector: selectSearchTerm, value: '' },
            { selector: selectError, value: null },
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
    const greetingAt = (hour: number): string => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 7, 23, hour, 0, 0));

      const local = TestBed.createComponent(TaskListComponent).componentInstance;
      const greeting = local.greeting();

      vi.useRealTimers();

      return greeting;
    };

    it('dice buenos días por la mañana', () => {
      expect(greetingAt(9)).toBe('Buenos días');
    });

    it('dice buenas tardes por la tarde', () => {
      expect(greetingAt(15)).toBe('Buenas tardes');
    });

    it('dice buenas noches por la noche', () => {
      expect(greetingAt(21)).toBe('Buenas noches');
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

  describe('formulario en modal', () => {
    it('abre el sheet y despacha addTask con lo que devuelve', async () => {
      await component.openForm();

      expect(modalCtrl.create).toHaveBeenCalledOnce();
      expect(modal.present).toHaveBeenCalledOnce();
      expect(dispatch).toHaveBeenCalledWith(TaskActions.addTask({ task: payload }));
    });

    it('no despacha nada si el usuario cancela', async () => {
      modal.onWillDismiss.mockResolvedValue({ data: null, role: 'cancel' });
      dispatch.mockClear();

      await component.openForm();

      expect(dispatch).not.toHaveBeenCalled();
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
