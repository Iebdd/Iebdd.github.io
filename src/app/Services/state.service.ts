import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Options } from '../model/dtypes';
import { States } from '../model/enums';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor() { }

  hidden_letters$ = new BehaviorSubject<boolean>(false);
  hidden_hints$ = new BehaviorSubject<boolean>(true);
  loading$ = new BehaviorSubject<boolean>(true);
  options$ = new BehaviorSubject<Options>({directions: [true, false, false], n0words: 15, amap: true});
  default_grid$ = new BehaviorSubject<boolean>(true);
  working$ = new BehaviorSubject<boolean>(false);


  getLetterVisibility(): Observable<boolean> {
    return this.hidden_letters$.asObservable();
  }

  getHintVisibility(): Observable<boolean> {
    return this.hidden_hints$.asObservable();
  }

  getGridState(): Observable<boolean> {
    return this.default_grid$.asObservable();
  }

  getWorkingState(): Observable<boolean> {
    return this.working$.asObservable();
  }

  toggleState(element: number): void {
    if(element == States.Working) {
    }
    switch(element) {
      case States.Load:
        this.loading$.next(!this.loading$.value);
      break;
      case States.Letters:
        this.hidden_letters$.next(!this.hidden_letters$.value);
      break;
      case States.Hints:
        this.hidden_hints$.next(!this.hidden_hints$.value);
      break;
      case States.Grid:
        this.default_grid$.next(!this.default_grid$.value);
      break;
      case States.Working:
        this.working$.next(!this.working$.value);
    }
  }

  getLoadState(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getOptions(): Observable<Options> {
    return this.options$.asObservable();
  }

  setOptions(options: Options): void {
    this.options$.next(options);
  }
}
