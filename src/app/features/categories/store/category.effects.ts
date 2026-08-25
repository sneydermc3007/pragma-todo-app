import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';

import { catchError, concatMap, filter, map, of, switchMap } from 'rxjs';

import { CategoryActions } from './category.actions';
import { selectAllCategories } from './category.selectors';

import { newId } from '../../../core/utils/id';
import { CategoryService } from '../services/category.service';

import type { ICategory } from '../models/category.model';

@Injectable()
export class CategoryEffects {
    private actions$: Actions = inject(Actions);
    private store: Store = inject(Store);
    private categoryService: CategoryService = inject(CategoryService);

    loadCategories$ = createEffect(() => this.actions$.pipe(
        ofType(CategoryActions.loadCategories),
        switchMap(() => this.categoryService.getAll().pipe(
            map((categories) => CategoryActions.loadCategoriesSuccess({ categories })),
            catchError((error: Error) => of(CategoryActions.loadCategoriesFailure({ error: error.message })))
        ))
    ));

    addCategory$ = createEffect(() => this.actions$.pipe(
        ofType(CategoryActions.addCategory),
        concatLatestFrom(() => this.store.select(selectAllCategories)),
        concatMap(([{ category }, categories]) => {
            const created: ICategory = {
                ...category,
                id: newId(),
                createdAt: new Date().toISOString()
            };

            return this.categoryService.saveAll([...categories, created]).pipe(
                map(() => CategoryActions.addCategorySuccess({ category: created })),
                catchError((error: Error) => of(CategoryActions.addCategoryFailure({ error: error.message })))
            );
        })
    ));

    updateCategory$ = createEffect(() => this.actions$.pipe(
        ofType(CategoryActions.updateCategory),
        concatLatestFrom(() => this.store.select(selectAllCategories)),
        map(([action, categories]) => ({
            action,
            current: categories.find((category) => category.id === action.id),
            categories
        })),
        filter(({ current }) => !!current),
        concatMap(({ action, current, categories }) => {
            const updated: ICategory = { ...current!, ...action.changes };

            return this.categoryService
                .saveAll(categories.map((category) => (category.id === updated.id ? updated : category)))
                .pipe(
                    map(() => CategoryActions.updateCategorySuccess({ category: updated })),
                    catchError((error: Error) =>
                        of(CategoryActions.updateCategoryFailure({ error: error.message })))
                );
        })
    ));

    deleteCategory$ = createEffect(() => this.actions$.pipe(
        ofType(CategoryActions.deleteCategory),
        concatLatestFrom(() => this.store.select(selectAllCategories)),
        concatMap(([{ id }, categories]) =>
            this.categoryService.saveAll(categories.filter((category) => category.id !== id)).pipe(
                map(() => CategoryActions.deleteCategorySuccess({ id })),
                catchError((error: Error) => of(CategoryActions.deleteCategoryFailure({ error: error.message })))
            )
        )
    ));
}
