import { Component, OnInit} from '@angular/core';
import { GridComponent } from './grid/grid.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { TranslocoService } from '@ngneat/transloco';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [GridComponent, TopBarComponent, ControlPanelComponent]
})
export class AppComponent implements OnInit {

  String = String;
  

  constructor (private translocoService: TranslocoService) {}
  title = 'Crossword_Maker';

  ngOnInit() {

  }

}


/* /(polyfills|vendor|styles|main|runtime).js/ */