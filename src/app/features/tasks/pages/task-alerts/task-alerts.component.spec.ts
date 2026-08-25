import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TaskActions } from '../../store/task.actions';
import { selectOverdueTasks, selectUpcomingTasks } from '../../store/task.selectors';
import { selectCategoryEntities } from '../../../categories/store/category.selectors';
import { selectUse24hClock } from '../../../remote-config/store/remote-config.selectors';
import { TaskFormService } from '../../services/task-form.service';
import { TaskFeedbackService } from '../../services/task-feedback.service';

import { TaskAlertsComponent } from './task-alerts.component';

import { ETaskPriority } from '../../models/task.enum';

import type { ITask } from '../../models/task.model';

const task = (overrides: Partial<ITask> = {}): ITask => ({
  id: 'task-1',
  title: 'Pagar la luz',
  description: null,
  priority: ETaskPriority.HIGH,
  completed: false,
  categoryId: null,
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
  let feedback: { confirmDelete: ReturnType<typeof vi.fn>; notify: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    feedback = {
      confirmDelete: vi.fn().mockResolvedValue(true),
      notify: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      imports: [TaskAlertsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService(),
        { provide: TaskFormService, useValue: { open: vi.fn() } },
        { provide: TaskFeedbackService, useValue: feedback },
        provideMockStore({
          selectors: [
            { selector: selectUse24hClock, value: false },
            { selector: selectOverdueTasks, value: [task()] },
            { selector: selectUpcomingTasks, value: [task({ id: 'task-2', scheduledDate: '2099-01-01' })] },
            { selector: selectCategoryEntities, value: {} },
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
