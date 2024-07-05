import { Injectable, OnDestroy } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Subject, takeUntil, Observable } from 'rxjs';
import { Screen } from '../model/enums';;

@Injectable({
  providedIn: 'root'
})
export class BreakpointService implements OnDestroy {

  constructor(private breakpointObserver: BreakpointObserver) {
    breakpointObserver
    .observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
      Breakpoints.Handset
    ])
    .pipe(takeUntil(this.destroyed))
    .subscribe(result => {
      (result.matches) ? this.screenSize.next(Screen.handheld) : this.screenSize.next(Screen.notHandheld);
    })
   }

   private screenSize = new BehaviorSubject<number>(Screen.notHandheld);
   destroyed = new Subject<void>();

   getSize(): Observable<number> {
    return this.screenSize.asObservable();
   }

   ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
   }
}
