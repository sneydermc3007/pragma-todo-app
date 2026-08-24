import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalController } from '@ionic/angular';

import { TaskFormComponent } from './task-form.component';

import { ETaskPriority } from '../../models/task.enum';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let modalCtrl: { dismiss: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    modalCtrl = { dismiss: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalController, useValue: modalCtrl },
      ],
    });

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scheduledDate', '2026-08-25');

    await fixture.whenStable();
  });

  it('preselecciona el día que le pasa quien lo abre', () => {
    expect(component.form.controls.scheduledDate.value).toBe('2026-08-25');
  });

  describe('validación', () => {
    it('arranca inválido por el título vacío', () => {
      expect(component.form.invalid).toBe(true);
    });

    it('rechaza un título de solo espacios', () => {
      component.form.controls.title.setValue('   ');

      expect(component.form.controls.title.hasError('required')).toBe(true);
    });

    it('rechaza que la hora de fin sea anterior a la de inicio', () => {
      component.form.patchValue({ title: 'Reunión', startTime: '15:00', endTime: '14:00' });

      expect(component.form.hasError('timeRange')).toBe(true);
    });

    it('rechaza horas iguales', () => {
      component.form.patchValue({ title: 'Reunión', startTime: '15:00', endTime: '15:00' });

      expect(component.form.hasError('timeRange')).toBe(true);
    });

    it('acepta un rango válido', () => {
      component.form.patchValue({ title: 'Reunión', startTime: '14:00', endTime: '15:00' });

      expect(component.form.hasError('timeRange')).toBe(false);
      expect(component.form.valid).toBe(true);
    });

    it('no valida el rango si falta una de las dos horas', () => {
      component.form.patchValue({ title: 'Reunión', startTime: '14:00', endTime: '' });

      expect(component.form.hasError('timeRange')).toBe(false);
      expect(component.form.valid).toBe(true);
    });
  });

  describe('submit', () => {
    it('cierra el modal con el payload trimeado y las horas en null si están vacías', () => {
      component.form.patchValue({
        title: '  Comprar café  ',
        description: '  del bueno  ',
        priority: ETaskPriority.HIGH,
        scheduledDate: '2026-08-25',
        startTime: '',
        endTime: '',
      });

      component.submit();

      expect(modalCtrl.dismiss).toHaveBeenCalledWith(
        {
          title: 'Comprar café',
          description: 'del bueno',
          priority: ETaskPriority.HIGH,
          scheduledDate: '2026-08-25',
          startTime: null,
          endTime: null,
        },
        'confirm'
      );
    });

    it('no cierra el modal si el formulario es inválido, y marca los campos', () => {
      component.submit();

      expect(modalCtrl.dismiss).not.toHaveBeenCalled();
      expect(component.form.controls.title.touched).toBe(true);
    });
  });

  it('cancel cierra el modal sin datos', () => {
    component.cancel();

    expect(modalCtrl.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });
});
