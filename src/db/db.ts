import Dexie, { Table } from 'dexie';
import { DatabaseService } from '../app/Services/database.service';
import { Injectable } from '@angular/core';


export interface Occurence {
  id?: number,
  ids: number[],
  occurence: number[]
}
export interface Word {
  id?: number,
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
      Words: '++id',
      Hints: '++id',
      Occurences: '++, occurence*',
    });
  }

  getChar(letter: string): number {
    letter = letter.toLowerCase();
    return letter.charCodeAt(0) - 97
  }

  async resetDatabase() {
    await db.transaction('rw', 'Occurences', 'Hints', 'Words', 'Dict_Entry', () => {
      this.Occurences.clear();
      this.Hints.clear();
      this.Words.clear();
    });
  }
}

export const db = new AppDB();
