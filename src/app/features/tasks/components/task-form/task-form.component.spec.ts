import { provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
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
        provideTranslateService(),
        { provide: ModalController, useValue: modalCtrl },
      ],
    });

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('scheduledDate', '2026-08-25');

    await fixture.whenStable();
  });

  describe('valores por defecto al crear', () => {
    it('propone un rango horario válido', () => {
      const { startTime, endTime } = component.form.getRawValue();

      expect(startTime).toMatch(/^\d{2}:00$/);
      expect(endTime).toMatch(/^\d{2}:00$/);
      expect(endTime > startTime).toBe(true);
      expect(component.form.hasError('timeRange')).toBe(false);
    });

    it('el hourCycle sigue al feature flag', () => {
      expect(component.hourCycle()).toBe('h12');

      fixture.componentRef.setInput('use24hClock', true);

      expect(component.hourCycle()).toBe('h23');
    });
  });

  describe('setTime', () => {
    it('normaliza lo que emite el picker a HH:mm', () => {
      component.setTime('startTime', '08:15:00');

      expect(component.form.controls.startTime.value).toBe('08:15');
    });

    it('vacía el control cuando el picker no devuelve una hora', () => {
      component.setTime('endTime', null);

      expect(component.form.controls.endTime.value).toBe('');
    });
  });

  describe('timeValue', () => {
    it('agrega los segundos que espera ion-datetime', () => {
      component.form.controls.startTime.setValue('08:15');

      expect(component.timeValue('startTime')).toBe('08:15:00');
    });

    it('devuelve null cuando no hay hora, para que el picker no muestre una falsa', () => {
      component.form.controls.startTime.setValue('');

      expect(component.timeValue('startTime')).toBeNull();
    });
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
        categoryId: '',
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
          categoryId: null,
          scheduledDate: '2026-08-25',
          startTime: null,
          endTime: null,
        },
        'confirm'
      );
    });

    it('manda categoryId en null cuando se elige «Sin categoría»', () => {
      component.form.patchValue({ title: 'Sin categoría', categoryId: '' });

      component.submit();

      expect(modalCtrl.dismiss).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: null }),
        'confirm'
      );
    });

    it('manda el id de la categoría elegida', () => {
      component.form.patchValue({ title: 'Con categoría', categoryId: 'cat-1' });

      component.submit();

      expect(modalCtrl.dismiss).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' }),
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
