import Dexie, { Table } from 'dexie';

export interface Word {
  id?: number,
  hint_id: number,
  word: number[]
}
export interface Hint {
  id?: number,
  hint: string
}

export class AppDB extends Dexie {
  Words!: Table<Word, number>;
  Hints!: Table<Hint, number>;

  constructor() {
    super('Crossword');
    this.version(1).stores({
      Words: '++id, hint_id, word*',
      Hints: '++id',
    });
  }

  async deleteDatabase() {
    await Dexie.delete('Crossword');
    await Dexie.delete('__dbnames');
  }
}

export const db = new AppDB();
