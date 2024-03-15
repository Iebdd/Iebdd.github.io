import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { db } from '../../db/db';
import { LetterPipe } from '../Pipes/letter.pipe';
import { LoadDataService } from './load-data.service';
import { Dict_Entry } from '../model/dtypes';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private LetterPipe: LetterPipe,
              private LoadDataService: LoadDataService) { }

  async addWord(word: string, hint_id: number) {
    db.Words.add({
      word: word,
      hint_id: hint_id
    })
  }

  async addOccurence(ids: number[], occurence: number[]) {
    db.Occurences.add({
      ids: ids,
      occurence: occurence
    })
  }

  async addHint(hint: string) {
    db.Hints.add({
      hint: hint
    })
  }

  async getWord(word_id: number) {
    return db.Words.get({
      id: word_id
    });
  }

  async getWords() {
    return db.Words
    .toArray();
  }

  async getHint(hint_id: number) {
    return db.Hints.get({
      id: hint_id
    });
  }

  async getOccurences(letter: number) {
    return db.Occurences
      .where('occurence')
      .equals(letter)
      .toArray();
  }

  async initDB(): Promise<boolean> {
    let exist: boolean = true;
    await Dexie.exists("Crossword")
      .then(function(exists) {(!exists) ? exist = false : null;})
    await db.open()
      .then(data => console.log("Dexie DB opened"))
      .catch(err => console.log(err.message));
    if(!exist){
      return true;
    }
    return false;
  }

  async createEntries() {
    let word_count: number = 0;
    let curr_entry: Dict_Entry = {
      hint: '',
      words: []
    };
    let occs_buffer: number[] = [];
    let hint_no: number = this.LoadDataService.getLength();
    for (let hints = 0; hints < hint_no; hints++) {
      curr_entry = this.LoadDataService.getFragment(hints);
      this.addHint(curr_entry.hint);
      for (let words = 0; words < curr_entry.words.length; words++) {
        this.addWord(curr_entry.words[words], hints);
        for(let occs = 0; occs < curr_entry.words[words].length; occs++) {
          occs_buffer.push(this.LetterPipe.transform(curr_entry.words[words][occs]));
        }
        this.addOccurence([hints, word_count], occs_buffer);
        word_count++;
        occs_buffer.length = 0;
      }
    }
  }

}

