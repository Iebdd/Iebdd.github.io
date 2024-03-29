import { Pipe, PipeTransform } from '@angular/core';
import { LoadDataService } from '../Services/load-data.service';

@Pipe({
  name: 'replacement',
  standalone: true
})
export class ReplacementPipe implements PipeTransform {

  constructor(private loadDataService: LoadDataService){}
  replacements: string[] = [];
  matches: [number, number][] = [];

  transform(input: string): string {                        //Replaces placeholders for often repeated strings within the input file according
    if(!this.replacements.length) {                         //to a provided array. {0} corresponds to the 0th element of the array and so forth
      this.loadDataService.replacements
      .subscribe(element => this.replacements = element);
    }
    if(!input) {
      return '';
    }
    for ( const match of input.matchAll(/\{(\d\d?\d?)\}/g) ) {      //This construct is necessary since String.replace replacer functions cannot
      if(match.index != undefined) {                                //access class methods or properties.
        this.matches.push([match.index, parseInt(match[1])]);
      }
    }
    this.matches.reverse();                                                 // It is necessary for the replacement to start from the back since
    for(const match of this.matches) {                                      // the earlier entries would otherwise shift the index
      input = input.slice(0, match[0]) + this.replacements[match[1]] + input.slice(match[0] + match[1].toString().length + 2, input.length);
    }
    return input;
  }
}

