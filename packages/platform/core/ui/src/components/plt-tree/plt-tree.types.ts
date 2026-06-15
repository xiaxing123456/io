export type PltRowId = string | number;

export interface PltTreeRowData {
    id: PltRowId;
    parentId: PltRowId | null;
    label: string;
    children?: PltTreeRowData[];
    [key: string]: any;
}

export type PltTreeRowDataKey<T extends keyof PltTreeRowData> = keyof Pick<PltTreeRowData, T>;

export type MoveType = 'top' | 'middle' | 'bottom';

export type MoveRootType = Exclude<MoveType, 'middle'>;

export interface SearchResult {
    filteredTree: PltTreeRowData[];
    matchedIds: string[];
}
