import { Pipe, PipeTransform } from '@angular/core';
import { LowerCasePipe } from '@angular/common';

@Pipe({
  name: 'letterPipe'
})
export class LetterPipe implements PipeTransform {

  constructor(private LowerCasePipe: LowerCasePipe) {}

    charMap = new Map<number, number> ([
      [228, 26], [246, 27], [252, 28], [223, 29], [233, 30], [224, 31], [232, 32], [249, 33], [231, 34], [226, 35], [234, 36], [238, 37],
      [244, 38], [251, 39], [235, 40], [239, 41], [241, 42], [225, 43], [237, 44], [243, 45], [250, 46], [227, 47], [230, 48], [248, 49], [229, 50]
    ])

    letterMap = new Map<number, number> ([
      [26, 228], [27, 246], [28, 252], [29, 223], [30, 233], [31, 224], [32, 232], [33, 249], [34, 231], [35, 226], [36, 234], [37, 238],
      [38, 244], [39, 251], [40, 235], [41, 239], [42, 241], [43, 225], [44, 237], [45, 243], [46, 250], [47, 227], [48, 230], [49, 248], [50, 229]
    ])

    numbers = new Set([97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 
                       119, 120, 121, 122, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 237, 238, 239, 241, 
                       243, 244, 246, 248, 249, 250, 251, 252])

  // Most languages replace special letters like 'ä' with 'ae' within a crossword but I am keeping a few
  // special letters in case this proves to not always be the case

  transform(input_s: string | number): number {
    let input: number = 0;
    if (typeof input_s === 'string') {
      input = this.LowerCasePipe.transform(input_s).charCodeAt(0);
    }
    else {
      input = input_s;
    }
    if (!this.letterMap.get(input) && !this.charMap.get(input)) {
      (input < 26) ? input = input + 97 : input = input - 97 ;
      if ((input <= 50 && input >= 0) || this.numbers.has(input)) {
        return input;
      }
      else {
        console.log(`Unknown number detected: ${input + 97}`);
        return -1;
      }
    }
    else {
      return (this.letterMap.get(input)) ? this.letterMap.get(input)! : this.charMap.get(input)!;
    }
  }
}
