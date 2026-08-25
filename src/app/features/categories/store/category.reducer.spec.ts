import { categoryReducer, initialState } from './category.reducer';
import { CategoryActions } from './category.actions';

import type { ICategory } from '../models/category.model';

const category = (overrides: Partial<ICategory> = {}): ICategory => ({
    id: 'cat-1',
    name: 'Trabajo',
    color: '#3880ff',
    createdAt: '2026-08-25T10:00:00.000Z',
    ...overrides,
});

const names = (state: { ids: string[] | number[]; entities: Record<string, ICategory | undefined> }): (string | undefined)[] =>
    (state.ids as string[]).map((id) => state.entities[id]?.name);

describe('categoryReducer', () => {
    describe('carga', () => {
        it('marca loading y limpia el error anterior al pedir la carga', () => {
            const state = categoryReducer(
                { ...initialState, error: 'sin acceso' },
                CategoryActions.loadCategories()
            );

            expect(state.loading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('reemplaza la colección completa con loadCategoriesSuccess', () => {
            const conDatos = categoryReducer(
                initialState,
                CategoryActions.loadCategoriesSuccess({ categories: [category()] })
            );
            const state = categoryReducer(
                conDatos,
                CategoryActions.loadCategoriesSuccess({ categories: [category({ id: 'cat-2', name: 'Personal' })] })
            );

            expect(state.ids).toEqual(['cat-2']);
            expect(state.loading).toBe(false);
        });
    });

    describe('alta, edición y borrado', () => {
        it('agrega una categoría con addCategorySuccess', () => {
            const state = categoryReducer(initialState, CategoryActions.addCategorySuccess({ category: category() }));

            expect(state.entities['cat-1']?.name).toBe('Trabajo');
            expect(state.entities['cat-1']?.color).toBe('#3880ff');
            expect(state.loading).toBe(false);
        });

        it('reemplaza la categoría con updateCategorySuccess', () => {
            let state = categoryReducer(initialState, CategoryActions.addCategorySuccess({ category: category() }));
            state = categoryReducer(state, CategoryActions.updateCategorySuccess({
                category: category({ name: 'Oficina', color: '#eb445a' }),
            }));

            expect(state.ids).toEqual(['cat-1']);
            expect(state.entities['cat-1']?.name).toBe('Oficina');
            expect(state.entities['cat-1']?.color).toBe('#eb445a');
        });

        it('elimina la categoría con deleteCategorySuccess', () => {
            let state = categoryReducer(initialState, CategoryActions.addCategorySuccess({ category: category() }));
            state = categoryReducer(state, CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

            expect(state.ids).toEqual([]);
            expect(state.entities['cat-1']).toBeUndefined();
        });
    });

    describe('errores', () => {
        it('guarda el mensaje y apaga loading en cada Failure', () => {
            const failures = [
                CategoryActions.loadCategoriesFailure({ error: 'sin acceso' }),
                CategoryActions.addCategoryFailure({ error: 'nombre repetido' }),
                CategoryActions.updateCategoryFailure({ error: 'no existe' }),
                CategoryActions.deleteCategoryFailure({ error: 'en uso' }),
            ];

            for (const failure of failures) {
                const state = categoryReducer({ ...initialState, loading: true }, failure);

                expect(state.error).toBe(failure.error);
                expect(state.loading).toBe(false);
            }
        });

        it('un Failure no toca las categorías que ya estaban', () => {
            const conDatos = categoryReducer(initialState, CategoryActions.addCategorySuccess({ category: category() }));
            const state = categoryReducer(conDatos, CategoryActions.deleteCategoryFailure({ error: 'en uso' }));

            expect(state.ids).toEqual(['cat-1']);
        });
    });

    describe('orden', () => {
        it('ordena alfabéticamente por nombre', () => {
            const state = categoryReducer(initialState, CategoryActions.loadCategoriesSuccess({
                categories: [
                    category({ id: '1', name: 'Trabajo' }),
                    category({ id: '2', name: 'Casa' }),
                    category({ id: '3', name: 'Personal' }),
                ],
            }));

            expect(names(state)).toEqual(['Casa', 'Personal', 'Trabajo']);
        });

        it('ordena sin que las mayúsculas manden por delante de las minúsculas', () => {
            const state = categoryReducer(initialState, CategoryActions.loadCategoriesSuccess({
                categories: [
                    category({ id: '1', name: 'Trabajo' }),
                    category({ id: '2', name: 'personal' }),
                ],
            }));

            expect(names(state)).toEqual(['personal', 'Trabajo']);
        });

        it('ordena los acentos junto a su letra, no al final', () => {
            const state = categoryReducer(initialState, CategoryActions.loadCategoriesSuccess({
                categories: [
                    category({ id: '1', name: 'Zapatos' }),
                    category({ id: '2', name: 'Ámbar' }),
                ],
            }));

            expect(names(state)).toEqual(['Ámbar', 'Zapatos']);
        });

        it('ubica la categoría nueva en su lugar, no al final', () => {
            let state = categoryReducer(initialState, CategoryActions.loadCategoriesSuccess({
                categories: [category({ id: '1', name: 'Casa' }), category({ id: '2', name: 'Trabajo' })],
            }));
            state = categoryReducer(state, CategoryActions.addCategorySuccess({
                category: category({ id: '3', name: 'Personal' }),
            }));

            expect(names(state)).toEqual(['Casa', 'Personal', 'Trabajo']);
        });
    });

    it('no muta el estado anterior', () => {
        const before = categoryReducer(initialState, CategoryActions.addCategorySuccess({ category: category() }));
        const after = categoryReducer(before, CategoryActions.deleteCategorySuccess({ id: 'cat-1' }));

        expect(before.ids).toEqual(['cat-1']);
        expect(before.entities['cat-1']).toBeDefined();
        expect(after).not.toBe(before);
    });
});
