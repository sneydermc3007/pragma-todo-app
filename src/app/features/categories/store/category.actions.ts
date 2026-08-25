import { createActionGroup, props, emptyProps } from '@ngrx/store';

import type { ICategory, TAddCategoryPayload, TUpdateCategoryPayload } from '../models/category.model';

export const CategoryActions = createActionGroup({
    source: 'Category',
    events: {
        'Load Categories': emptyProps(),
        'Load Categories Success': props<{ categories: ICategory[] }>(),
        'Load Categories Failure': props<{ error: string }>(),

        'Add Category': props<{ category: TAddCategoryPayload }>(),
        'Add Category Success': props<{ category: ICategory }>(),
        'Add Category Failure': props<{ error: string }>(),

        'Update Category': props<TUpdateCategoryPayload>(),
        'Update Category Success': props<{ category: ICategory }>(),
        'Update Category Failure': props<{ error: string }>(),

        'Delete Category': props<{ id: string }>(),
        'Delete Category Success': props<{ id: string }>(),
        'Delete Category Failure': props<{ error: string }>()
    }
})
