import Dexie, { Table } from 'dexie';


export interface Occurence {
  id?: number,
  ids: number[],
  occurence: number[]
}
export interface Word {
  id?: number,
  hint_id: number,
  word: string
}
export interface Hint {
  id?: number,
  hint: string
}

export class AppDB extends Dexie {
  Occurences!: Table<Occurence, number>;
  Words!: Table<Word, number>;
  Hints!: Table<Hint, number>;


  constructor() {
    super('Crossword');
    this.version(1).stores({
      Words: '++id, hint_id',
      Hints: '++id',
      Occurences: '++, occurence*',
    });
  }

  async resetDatabase() {
    await db.transaction('rw', 'Occurences', 'Hints', 'Words', () => {
      this.Occurences.clear();
      this.Hints.clear();
      this.Words.clear();
    });
  }
}

export const db = new AppDB();
