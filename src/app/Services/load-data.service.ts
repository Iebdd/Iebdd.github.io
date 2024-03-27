import { Injectable } from '@angular/core';
import data from '../../assets/Data/words.json';
import { Dict_Entry } from '../model/dtypes';
import { Observable, of} from 'rxjs';

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
  progress: number = 0;
  
  getFragment(letter: number, index: number): Dict_Entry {
    const Entry: Dict_Entry = {
      hint: this.json_data['words'][this.letters[letter]][index][0],
      words: this.json_data['words'][this.letters[letter]][index][1]
    }
    return Entry;
  }

  getAvailableLetters(): Observable<number> {
    return of(this.available_letters);
  }

  getLength(index: number): number {
    this.max_index = this.json_data['words'][this.letters[index]].length;
    return this.max_index;
  }

  getTotalLength(): number {
    let total_length: number = 0;
    console.log(this.letters[0]);
    for (let index = 0; index < this.available_letters; index++) {
      total_length += this.json_data['words'][this.letters[index]].length
    }
    return total_length;
  }

  getReplacements(): Observable<string[]> {
    return of(this.json_data['replacements']);
  }

}

