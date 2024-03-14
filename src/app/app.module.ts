import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, LowerCasePipe, UpperCasePipe} from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LetterPipe } from './Pipes/letter.pipe';
import { GridComponent } from './grid/grid.component';
import { RndIntPipe } from './Pipes/rnd-int.pipe';
import { CharPipe } from './Pipes/char.pipe';
import { Occ2WordPipe } from './Pipes/occ2word.pipe';

@NgModule({
  declarations: [
    AppComponent,
    LetterPipe,
    GridComponent,
    CharPipe,
    Occ2WordPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
  ],
  providers: [LetterPipe, LowerCasePipe, UpperCasePipe, RndIntPipe, CharPipe, Occ2WordPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
