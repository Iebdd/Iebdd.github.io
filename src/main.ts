import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { importProvidersFrom } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { Occ2WordPipe } from './app/Pipes/occ2word.pipe';
import { CharPipe } from './app/Pipes/char.pipe';
import { RndIntPipe } from './app/Pipes/rnd-int.pipe';
import { LowerCasePipe, UpperCasePipe, CommonModule } from '@angular/common';
import { LetterPipe } from './app/Pipes/letter.pipe';
import { ReplacementPipe } from './app/Pipes/replacement.pipe';


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, CommonModule),
        LetterPipe, LowerCasePipe, UpperCasePipe, RndIntPipe, CharPipe, Occ2WordPipe, ReplacementPipe
    ]
})
  .catch(err => console.error(err));
