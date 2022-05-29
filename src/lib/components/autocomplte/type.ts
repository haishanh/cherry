export enum TagState {
  New = 'new',
  Deleted = 'deleted',
}

export type TagType = { id: number | string; name: string; state?: TagState };
