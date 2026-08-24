import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalController } from '@ionic/angular';

import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectVisibleTasks } from '../../store/task.selectors';

import { TaskAgendaComponent } from './task-agenda.component';

import { ETaskPriority } from '../../models/task.enum';

import type { TAddTaskPayload } from '../../models/task.model';

describe('TaskAgendaComponent', () => {
  let component: TaskAgendaComponent;
  let fixture: ComponentFixture<TaskAgendaComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;
  let modalCtrl: { create: ReturnType<typeof vi.fn> };
  let modal: { present: ReturnType<typeof vi.fn>; onWillDismiss: ReturnType<typeof vi.fn> };

  const payload: TAddTaskPayload = {
    title: 'Reunión',
    description: null,
    priority: ETaskPriority.HIGH,
    scheduledDate: '2026-08-25',
    startTime: '10:00',
    endTime: '11:00',
  };

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 17, 9, 0, 0));

    modal = {
      present: vi.fn().mockResolvedValue(undefined),
      onWillDismiss: vi.fn().mockResolvedValue({ data: payload, role: 'confirm' }),
    };
    modalCtrl = { create: vi.fn().mockResolvedValue(modal) };

    TestBed.configureTestingModule({
      imports: [TaskAgendaComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalController, useValue: modalCtrl },
        provideMockStore({
          selectors: [{ selector: selectVisibleTasks, value: [] }],
        }),
      ],
    });

    fixture = TestBed.createComponent(TaskAgendaComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    dispatch = vi.spyOn(store, 'dispatch');

    await fixture.whenStable();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('pide la carga de tareas al inicializarse', () => {
    expect(dispatch).toHaveBeenCalledWith(TaskActions.loadTasks());
  });

  describe('tira de la semana', () => {
    it('arranca en lunes y termina en domingo', () => {
      const week = component.week();

      expect(week).toHaveLength(7);
      expect(week[0].label).toBe('Lun');
      expect(week[6].label).toBe('Dom');
    });

    it('usa las claves de fecha local de la semana en curso', () => {
      const keys = component.week().map((day) => day.key);

      expect(keys[0]).toBe('2026-08-17');
      expect(keys[6]).toBe('2026-08-23');
    });

    it('expone el número de día para pintar la tira', () => {
      expect(component.week().map((day) => day.number)).toEqual([17, 18, 19, 20, 21, 22, 23]);
    });
  });

  describe('select', () => {
    it('cambia el día que se está mirando', () => {
      component.select('2026-08-20');

      expect(component.selectedDate()).toBe('2026-08-20');
    });

    it('no despacha nada al store: el día es estado de vista', () => {
      dispatch.mockClear();

      component.select('2026-08-20');

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('recalcula las tareas del día al cambiarlo', () => {
      component.select('2026-08-20');

      expect(component.tasks()).toEqual([]);
    });
  });

  describe('formulario', () => {
    it('abre el sheet precargando el día que se está mirando', async () => {
      await component.openForm();

      expect(modalCtrl.create).toHaveBeenCalledWith(
        expect.objectContaining({ componentProps: { scheduledDate: '2026-08-17' } })
      );
      expect(dispatch).toHaveBeenCalledWith(TaskActions.addTask({ task: payload }));
    });

    it('no despacha nada si se cancela', async () => {
      modal.onWillDismiss.mockResolvedValue({ data: null, role: 'cancel' });
      dispatch.mockClear();

      await component.openForm();

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  it('toggle y remove despachan sus acciones', () => {
    component.toggle('task-1');
    component.remove('task-2');

    expect(dispatch).toHaveBeenCalledWith(TaskActions.toggleTask({ id: 'task-1' }));
    expect(dispatch).toHaveBeenCalledWith(TaskActions.deleteTask({ id: 'task-2' }));
  });
});
