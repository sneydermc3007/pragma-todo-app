export interface ICategory {
    id: string;
    name: string;
    color: string;
    createdAt: string;
}

export type TAddCategoryPayload = Pick<ICategory, 'name' | 'color'>;

export type TUpdateCategoryPayload = {
    id: string;
    changes: Partial<Pick<ICategory, 'name' | 'color'>>;
};
