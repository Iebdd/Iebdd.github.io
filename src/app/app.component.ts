import { Component, OnInit } from '@angular/core';
import { DatabaseService } from './Services/database.service';
import { liveQuery } from 'dexie';
import { LetterPipe } from './Pipes/letter.pipe';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  String = String;
  

  constructor (private DatabaseService: DatabaseService,
               private LetterPipe: LetterPipe) {}
  title = 'Crossword_Maker';

  async ngOnInit() {
    this.DatabaseService.initDB();
  }

  results$ = liveQuery(() => this.DatabaseService.getOccurences(this.LetterPipe.transform('z')));

}


/* /(polyfills|vendor|styles|main|runtime).js/ */