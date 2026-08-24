import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectOverdueTasks, selectUpcomingTasks } from '../../store/task.selectors';

import { TaskAlertsComponent } from './task-alerts.component';

import { ETaskPriority } from '../../models/task.enum';

import type { ITask } from '../../models/task.model';

const task = (overrides: Partial<ITask> = {}): ITask => ({
  id: 'task-1',
  title: 'Pagar la luz',
  description: null,
  priority: ETaskPriority.HIGH,
  completed: false,
  scheduledDate: '2020-01-01',
  startTime: null,
  endTime: null,
  createdAt: '2020-01-01T10:00:00.000Z',
  updatedAt: '2020-01-01T10:00:00.000Z',
  ...overrides,
});

describe('TaskAlertsComponent', () => {
  let component: TaskAlertsComponent;
  let fixture: ComponentFixture<TaskAlertsComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TaskAlertsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [
            { selector: selectOverdueTasks, value: [task()] },
            { selector: selectUpcomingTasks, value: [task({ id: 'task-2', scheduledDate: '2099-01-01' })] },
          ],
        }),
      ],
    });

    fixture = TestBed.createComponent(TaskAlertsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);

    dispatch = vi.spyOn(store, 'dispatch');

    await fixture.whenStable();
  });

  it('pide la carga de tareas al inicializarse', () => {
    expect(dispatch).toHaveBeenCalledWith(TaskActions.loadTasks());
  });

  it('separa vencidas de próximas', () => {
    expect(component.overdue().map((t) => t.id)).toEqual(['task-1']);
    expect(component.upcoming().map((t) => t.id)).toEqual(['task-2']);
  });

  it('toggle despacha toggleTask', () => {
    component.toggle('task-1');

    expect(dispatch).toHaveBeenCalledWith(TaskActions.toggleTask({ id: 'task-1' }));
  });
});
