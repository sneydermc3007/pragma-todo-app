import { FormControl } from '@angular/forms';

import { uniqueName } from './unique-name.validator';

describe('uniqueName', () => {
  const validate = (taken: string[], value: string) =>
    uniqueName(taken)(new FormControl(value));

  it('acepta un nombre que no existe', () => {
    expect(validate(['Trabajo'], 'Personal')).toBeNull();
  });

  it('rechaza un nombre repetido', () => {
    expect(validate(['Trabajo'], 'Trabajo')).toEqual({ uniqueName: true });
  });

  it('no distingue mayúsculas', () => {
    expect(validate(['Trabajo'], 'trabajo')).toEqual({ uniqueName: true });
    expect(validate(['trabajo'], 'TRABAJO')).toEqual({ uniqueName: true });
  });

  it('ignora los espacios de los extremos', () => {
    expect(validate(['Trabajo'], '  Trabajo  ')).toEqual({ uniqueName: true });
    expect(validate(['  Trabajo  '], 'Trabajo')).toEqual({ uniqueName: true });
  });

  it('deja pasar el vacío, de eso se encarga notBlank', () => {
    expect(validate(['Trabajo'], '')).toBeNull();
    expect(validate(['Trabajo'], '   ')).toBeNull();
  });

  it('acepta cualquier nombre si no hay categorías', () => {
    expect(validate([], 'Trabajo')).toBeNull();
  });
});
