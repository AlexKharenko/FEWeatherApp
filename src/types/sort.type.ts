export type Sort = {
    column: string;
    isToggled: boolean;
    sortType: SortType;
};

export type SortType = 'desc' | 'asc';

export type EmitedSort = Omit<Sort, 'isToggled'>;
