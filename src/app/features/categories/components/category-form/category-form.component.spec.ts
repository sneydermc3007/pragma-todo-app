import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';

import { CategoryFormComponent } from './category-form.component';
import { CATEGORY_COLORS } from '../../models/category.const';

import type { ICategory } from '../../models/category.model';

const category: ICategory = {
  id: 'cat-1',
  name: 'Trabajo',
  color: '#3498db',
  createdAt: '2026-08-25T10:00:00.000Z',
};

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let modalCtrl: { dismiss: ReturnType<typeof vi.fn> };

  const build = async (inputs: Record<string, unknown> = {}): Promise<void> => {
    TestBed.resetTestingModule();
    modalCtrl = { dismiss: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [CategoryFormComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ModalController, useValue: modalCtrl },
      ],
    });

    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;

    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }

    await fixture.whenStable();
  };

  it('arranca vacío, inválido y con el primer color de la paleta', async () => {
    await build({ takenNames: [] });

    expect(component.isEditing).toBe(false);
    expect(component.form.invalid).toBe(true);
    expect(component.form.controls.color.value).toBe(CATEGORY_COLORS[0]);
  });

  it('precarga nombre y color al editar', async () => {
    await build({ category, takenNames: ['Trabajo'] });

    expect(component.isEditing).toBe(true);
    expect(component.form.getRawValue()).toEqual({ name: 'Trabajo', color: '#3498db' });
  });

  it('al editar no considera repetido su propio nombre', async () => {
    await build({ category, takenNames: ['Trabajo', 'Personal'] });

    expect(component.form.controls.name.hasError('uniqueName')).toBe(false);
  });

  it('al editar sí rechaza el nombre de otra categoría', async () => {
    await build({ category, takenNames: ['Trabajo', 'Personal'] });

    component.form.controls.name.setValue('Personal');

    expect(component.form.controls.name.hasError('uniqueName')).toBe(true);
  });

  it('al crear rechaza un nombre que ya existe', async () => {
    await build({ takenNames: ['Trabajo'] });

    component.form.controls.name.setValue('trabajo');

    expect(component.form.controls.name.hasError('uniqueName')).toBe(true);
  });

  it('pick cambia el color elegido', async () => {
    await build();

    component.pick('#2ecc71');

    expect(component.form.controls.color.value).toBe('#2ecc71');
  });

  it('cierra el modal con el nombre trimeado', async () => {
    await build({ takenNames: [] });

    component.form.patchValue({ name: '  Compras  ', color: '#e74c3c' });
    component.submit();

    expect(modalCtrl.dismiss).toHaveBeenCalledWith({ name: 'Compras', color: '#e74c3c' }, 'confirm');
  });

  it('no cierra el modal si el nombre es solo espacios', async () => {
    await build({ takenNames: [] });

    component.form.controls.name.setValue('   ');
    component.submit();

    expect(modalCtrl.dismiss).not.toHaveBeenCalled();
    expect(component.form.controls.name.touched).toBe(true);
  });

  it('cancel cierra el modal sin datos', async () => {
    await build();

    component.cancel();

    expect(modalCtrl.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });
});
