import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';


import { importProvidersFrom, isDevMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { Number2WordPipe } from './app/Pipes/number2word.pipe';
import { CharPipe } from './app/Pipes/char.pipe';
import { RndIntPipe } from './app/Pipes/rnd-int.pipe';
import { LowerCasePipe, UpperCasePipe, CommonModule } from '@angular/common';
import { LetterPipe } from './app/Pipes/letter.pipe';
import { ReplacementPipe } from './app/Pipes/replacement.pipe';
import { provideHttpClient } from '@angular/common/http';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@ngneat/transloco';


bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, CommonModule),
        LetterPipe, LowerCasePipe, UpperCasePipe, RndIntPipe, CharPipe, Number2WordPipe, ReplacementPipe, provideHttpClient(), provideTransloco({
        config: { 
          availableLangs: ['en', 'de', 'fr'],
          defaultLang: 'en',
          // Remove this option if your application doesn't support changing language in runtime.
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      })
    ]
})
  .catch(err => console.error(err));
