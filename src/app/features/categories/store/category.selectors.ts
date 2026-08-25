import { createFeatureSelector, createSelector } from '@ngrx/store';

import { categoryAdapter, type ICategoryState } from './category.reducer';
import { CATEGORIES_FEATURE_KEY } from '../models/category.const';

export const selectCategoryState = createFeatureSelector<ICategoryState>(CATEGORIES_FEATURE_KEY);

export const {
    selectAll: selectAllCategories,
    selectEntities: selectCategoryEntities,
    selectTotal: selectCategoryCount
} = categoryAdapter.getSelectors(selectCategoryState);

export const selectCategoriesLoading = createSelector(selectCategoryState, (state) => state.loading);

export const selectCategoriesError = createSelector(selectCategoryState, (state) => state.error);

export const selectCategoryNames = createSelector(selectAllCategories, (categories) =>
    categories.map((category) => category.name)
);
