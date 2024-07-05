import { Injectable } from '@angular/core';
import data from '../../assets/Data/words.json';
import { Dict_Entry } from '../model/dtypes';
import { Observable, of, BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/*               Load Data Service                       */
/*      Loads required data from the JSON file           */
/*      and distributes it to the other modules          */

export class LoadDataService{

  letters: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  sections: string[] = ['People', 'Locations', 'Religion', 'Misc'];
  available_letters: number = 1;
  json_data = JSON.parse(JSON.stringify(data));
  max_index: number = 0;
  
  getFragment(letter: number, index: number): Dict_Entry {
    const Entry: Dict_Entry = {
      hint: this.json_data['words'][this.letters[letter]][index][0],
      words: this.json_data['words'][this.letters[letter]][index][1]
    }
    return Entry;
  }

  get availableLetters(): Observable<number> {
    return of(this.available_letters);
  }

  getLengthByIndex(index: number): number {
    this.max_index = this.json_data['words'][this.letters[index]].length;
    return this.max_index;
  }

  get totalLength(): number {
    let total_length: number = 0;
    for (let letter_index = 0; letter_index < this.available_letters; letter_index++) {
      for(let word_index = 0; word_index < this.json_data['words'][this.letters[letter_index]].length; word_index++) {
        total_length += this.json_data['words'][this.letters[letter_index]][word_index][1].length
      }
    }
    return total_length;
  }

  get replacements(): Observable<string[]> {
    return of(this.json_data['replacements']);
  }

}

