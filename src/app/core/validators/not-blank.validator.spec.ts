import { FormControl } from '@angular/forms';

import { notBlank } from './not-blank.validator';

describe('notBlank', () => {
  const validate = (value: unknown) => notBlank(new FormControl(value));

  it('acepta un texto con contenido', () => {
    expect(validate('Comprar café')).toBeNull();
  });

  it('rechaza la cadena vacía', () => {
    expect(validate('')).toEqual({ required: true });
  });

  it('rechaza un texto de solo espacios', () => {
    expect(validate('   ')).toEqual({ required: true });
    expect(validate('\t\n ')).toEqual({ required: true });
  });

  it('acepta un texto que tiene espacios en los extremos pero contenido en el medio', () => {
    expect(validate('  Comprar café  ')).toBeNull();
  });

  it('rechaza lo que no es texto', () => {
    expect(validate(null)).toEqual({ required: true });
    expect(validate(undefined)).toEqual({ required: true });
    expect(validate(42)).toEqual({ required: true });
  });
});
