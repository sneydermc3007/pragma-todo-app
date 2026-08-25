import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskCardComponent } from './task-card.component';

import { ETaskPriority } from '../../models/task.enum';

import type { ITask } from '../../models/task.model';

const task = (overrides: Partial<ITask> = {}): ITask => ({
  id: 'task-1',
  title: 'Comprar café',
  description: null,
  priority: ETaskPriority.MEDIUM,
  completed: false,
  categoryId: null,
  scheduledDate: '2026-08-23',
  startTime: '14:00',
  endTime: '15:30',
  createdAt: '2026-08-23T10:00:00.000Z',
  updatedAt: '2026-08-23T10:00:00.000Z',
  ...overrides,
});

describe('TaskCardComponent', () => {
  let component: TaskCardComponent;
  let fixture: ComponentFixture<TaskCardComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TaskCardComponent],
      providers: [provideZonelessChangeDetection(), provideTranslateService()],
    });

    fixture = TestBed.createComponent(TaskCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('task', task());

    await fixture.whenStable();
  });

  describe('tone', () => {
    it('mapea cada prioridad a su tono', () => {
      fixture.componentRef.setInput('task', task({ priority: ETaskPriority.HIGH }));
      expect(component.tone()).toBe('high');

      fixture.componentRef.setInput('task', task({ priority: ETaskPriority.MEDIUM }));
      expect(component.tone()).toBe('medium');

      fixture.componentRef.setInput('task', task({ priority: ETaskPriority.LOW }));
      expect(component.tone()).toBe('low');
    });
  });

  describe('schedule', () => {
    it('muestra el rango cuando hay inicio y fin', () => {
      expect(component.schedule()).toBe('2:00 PM – 3:30 PM');
    });

    it('muestra solo el inicio cuando no hay fin', () => {
      fixture.componentRef.setInput('task', task({ endTime: null }));

      expect(component.schedule()).toBe('2:00 PM');
    });

    it('devuelve null cuando la tarea no tiene horario', () => {
      fixture.componentRef.setInput('task', task({ startTime: null, endTime: null }));

      expect(component.schedule()).toBeNull();
    });

    it('ignora el fin si no hay inicio', () => {
      fixture.componentRef.setInput('task', task({ startTime: null, endTime: '15:30' }));

      expect(component.schedule()).toBeNull();
    });
  });

  describe('edited', () => {
    it('es falso cuando la tarea nunca se modificó', () => {
      expect(component.wasEdited()).toBe(false);
    });

    it('es verdadero cuando updatedAt difiere de createdAt', () => {
      fixture.componentRef.setInput('task', task({ updatedAt: '2026-08-23T18:00:00.000Z' }));

      expect(component.wasEdited()).toBe(true);
    });
  });

  describe('salidas', () => {
    it('toggled emite el id de la tarea', () => {
      const spy = vi.fn();
      component.toggled.subscribe(spy);

      component.toggled.emit(component.task().id);

      expect(spy).toHaveBeenCalledWith('task-1');
    });

    it('edited emite la tarea completa', () => {
      const spy = vi.fn();
      component.edited.subscribe(spy);

      component.edited.emit(component.task());

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 'task-1' }));
    });

    it('removed emite el id de la tarea', () => {
      const spy = vi.fn();
      component.removed.subscribe(spy);

      component.removed.emit(component.task().id);

      expect(spy).toHaveBeenCalledWith('task-1');
    });
  });
});
