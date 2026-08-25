import { selectCategoryNames } from './category.selectors';

import type { ICategory } from '../models/category.model';

const category = (overrides: Partial<ICategory> = {}): ICategory => ({
    id: 'cat-1',
    name: 'Trabajo',
    color: '#3880ff',
    createdAt: '2026-08-25T10:00:00.000Z',
    ...overrides,
});

describe('selectCategoryNames', () => {
    it('devuelve los nombres respetando el orden de la colección', () => {
        const categories = [
            category({ id: '1', name: 'Casa' }),
            category({ id: '2', name: 'Personal' }),
            category({ id: '3', name: 'Trabajo' }),
        ];

        expect(selectCategoryNames.projector(categories)).toEqual(['Casa', 'Personal', 'Trabajo']);
    });

    it('devuelve vacío cuando no hay categorías', () => {
        expect(selectCategoryNames.projector([])).toEqual([]);
    });

    it('conserva los nombres tal cual, sin normalizar', () => {
        const categories = [category({ id: '1', name: '  Trabajo  ' })];

        expect(selectCategoryNames.projector(categories)).toEqual(['  Trabajo  ']);
    });
});
