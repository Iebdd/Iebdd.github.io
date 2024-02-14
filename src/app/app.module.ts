import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, LowerCasePipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LetterPipe } from './Pipes/letter.pipe';
import { GridComponent } from './grid/grid.component';

@NgModule({
  declarations: [
    AppComponent,
    LetterPipe,
    GridComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule
  ],
  providers: [LetterPipe, LowerCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
