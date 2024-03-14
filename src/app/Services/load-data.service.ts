import { Injectable } from '@angular/core';
import data from '../../assets/Data/words.json';
import { Dict_Entry } from '../model/dtypes';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/*               Load Data Service                       */
/*      Loads required data from the JSON file           */
/*      and distributes it to the other modules          */

export class LoadDataService{

  json_data = JSON.parse(JSON.stringify(data));
  
  getFragment(index: number): Dict_Entry {
    const Entry: Dict_Entry = {
      hint: this.json_data['words'][index][0],
      words: this.json_data['words'][index][1]
    }
    return Entry;
  }

  getLength(): number {
    return this.json_data['words'].length;
  }

}

