import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { TasksComponent } from './tasks.component';
import { TaskActions } from '../../store/tasks/task.actions';
import { selectAllTasks, selectError, selectLoading } from '../../store/tasks/task.selectors';
import { ETaskPriority } from '../../core/enum/task.enum';

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let store: MockStore;
  let dispatch: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        // El bootstrap de la app es zoneless: el entorno de test lo replica.
        provideZonelessChangeDetection(),
        provideMockStore({
          selectors: [
            { selector: selectAllTasks, value: [] },
            { selector: selectLoading, value: false },
            { selector: selectError, value: null },
          ],
        }),
      ],
    });

    fixture = TestBed.createComponent(TasksComponent);
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

  describe('validación del formulario', () => {
    it('arranca inválido y con prioridad media', () => {
      expect(component.form.invalid).toBe(true);
      expect(component.form.controls.priority.value).toBe(ETaskPriority.MEDIUM);
    });

    it('rechaza un título de solo espacios', () => {
      component.form.controls.title.setValue('    ');

      expect(component.form.controls.title.hasError('required')).toBe(true);
    });

    it('rechaza un título de más de 120 caracteres', () => {
      component.form.controls.title.setValue('a'.repeat(121));

      expect(component.form.controls.title.hasError('maxlength')).toBe(true);
    });

    it('acepta un título válido sin descripción', () => {
      component.form.controls.title.setValue('Comprar café');

      expect(component.form.valid).toBe(true);
    });
  });

  describe('add', () => {
    it('despacha addTask con los valores trimeados', () => {
      component.form.setValue({
        title: '  Comprar café  ',
        description: '  del bueno  ',
        priority: ETaskPriority.HIGH,
      });

      component.add();

      expect(dispatch).toHaveBeenCalledWith(TaskActions.addTask({
        task: { title: 'Comprar café', description: 'del bueno', priority: ETaskPriority.HIGH },
      }));
    });

    it('manda description en null cuando queda vacía', () => {
      component.form.setValue({
        title: 'Sin descripción',
        description: '   ',
        priority: ETaskPriority.LOW,
      });

      component.add();

      expect(dispatch).toHaveBeenCalledWith(TaskActions.addTask({
        task: { title: 'Sin descripción', description: null, priority: ETaskPriority.LOW },
      }));
    });

    it('resetea el formulario a sus valores iniciales después de agregar', () => {
      component.form.setValue({
        title: 'Algo',
        description: 'Detalle',
        priority: ETaskPriority.HIGH,
      });

      component.add();

      expect(component.form.getRawValue()).toEqual({
        title: '',
        description: '',
        priority: ETaskPriority.MEDIUM,
      });
      expect(component.form.pristine).toBe(true);
    });

    it('no despacha nada si el formulario es inválido, y marca los campos como touched', () => {
      dispatch.mockClear();
      component.form.controls.title.setValue('   ');

      component.add();

      expect(dispatch).not.toHaveBeenCalled();
      expect(component.form.controls.title.touched).toBe(true);
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
