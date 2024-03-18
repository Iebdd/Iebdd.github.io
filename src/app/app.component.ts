import { Component, OnInit} from '@angular/core';
import { GridComponent } from './grid/grid.component';
import { TranslocoService } from '@ngneat/transloco';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [GridComponent]
})
export class AppComponent implements OnInit {

  String = String;
  

  constructor (private translocoService: TranslocoService) {}
  title = 'Crossword_Maker';

  ngOnInit() {

  }

}


/* /(polyfills|vendor|styles|main|runtime).js/ */