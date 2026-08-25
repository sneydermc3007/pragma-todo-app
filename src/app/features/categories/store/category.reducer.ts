import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import { CategoryActions } from './category.actions';

import type { ICategory } from '../models/category.model';

export interface ICategoryState extends EntityState<ICategory> {
    loading: boolean;
    error: string | null;
}

export const categoryAdapter: EntityAdapter<ICategory> = createEntityAdapter<ICategory>({
    sortComparer: (a, b) => a.name.localeCompare(b.name)
});

export const initialState: ICategoryState = categoryAdapter.getInitialState({
    loading: false,
    error: null
});

export const categoryReducer = createReducer(
    initialState,

    on(CategoryActions.loadCategories, (state) => ({ ...state, loading: true, error: null })),
    on(CategoryActions.loadCategoriesSuccess, (state, { categories }) =>
        categoryAdapter.setAll(categories, { ...state, loading: false, error: null })
    ),
    on(CategoryActions.loadCategoriesFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(CategoryActions.addCategory, (state) => ({ ...state, loading: true, error: null })),
    on(CategoryActions.addCategorySuccess, (state, { category }) =>
        categoryAdapter.addOne(category, { ...state, loading: false, error: null })
    ),
    on(CategoryActions.addCategoryFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(CategoryActions.updateCategory, (state) => ({ ...state, loading: true, error: null })),
    on(CategoryActions.updateCategorySuccess, (state, { category }) =>
        categoryAdapter.upsertOne(category, { ...state, loading: false, error: null })
    ),
    on(CategoryActions.updateCategoryFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(CategoryActions.deleteCategory, (state) => ({ ...state, loading: true, error: null })),
    on(CategoryActions.deleteCategorySuccess, (state, { id }) =>
        categoryAdapter.removeOne(id, { ...state, loading: false, error: null })
    ),
    on(CategoryActions.deleteCategoryFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
