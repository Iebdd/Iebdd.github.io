import { Injectable } from '@angular/core';
import data from '../../assets/Data/words.json';
import { Dict_Entry } from '../model/dtypes';
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

/*               Load Data Service                       */
/*      Loads required data from the JSON file           */
/*      and distributes it to the other modules          */

export class LoadDataService{

  json_data = JSON.parse(JSON.stringify(data));
  max_index: number = 0;
  progress: number = 0;
  progress$ = new BehaviorSubject<number>(this.progress);
  
  getFragment(index: number): Dict_Entry {
    if(index % (Math.floor(this.max_index / 100)) === 0) {
      this.progress++;
      this.progress$.next(this.progress);
    }
    const Entry: Dict_Entry = {
      hint: this.json_data['words'][index][0],
      words: this.json_data['words'][index][1]
    }
    return Entry;
  }

  updateLoadingProgress(): Observable<number> {
    return this.progress$;
  }

  getLength(): number {
    this.max_index = this.json_data['words'].length;
    return this.max_index;
  }

  getReplacements(): Observable<string[]> {
    return of(this.json_data['replacements']);
  }

}

