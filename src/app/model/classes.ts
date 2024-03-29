import { Directions } from './enums';

export class Cell {
    private content: number;
    private hints: [boolean, string[], Directions[], number[]];
    private directions: Directions[];
    private ineligible: Directions[];

    constructor(content: number) {
        this.content = content;
        this.hints = [false, [], [], []];
        this.directions = [];
        this.ineligible = [];
    }

    reInit() {
        this.hints = [false, [], [], []],
        this.directions = [];
        this.content = -1;
    }
    set Content(new_content: number) {
        this.content = new_content;
    }
    addHint(new_hint: string, direction: Directions, index: number) {
        this.hints[0] = true;
        this.hints[1].push(new_hint);
        this.hints[2].push(direction);
        this.hints[3].push(index);
    }
    get Content(): number {
        return this.content;
    }
    get Directions(): Directions[] {
        return this.directions;
    }
    get Hints(): string[] {
        return this.hints[1];
    }

    get HintIndex() {
        return this.hints[3];
    }

    get Eligibility(): Directions[] {
        return this.ineligible;
    }

    get HintN0(): Directions[] {
        return this.hints[2];
    }

    addIneligibility(direction: Directions) {
        this.ineligible.push(direction);
    }
    addDirection(new_direction: Directions) {
        this.directions.push(new_direction);
    }
    removeDirection(rem_index: number) {
        if (rem_index >= this.directions.length) {
            throw new RangeError(`Invalid index: ${rem_index} >= ${this.directions.length}`);
        } else if (rem_index < 0) {
            throw new RangeError(`Invalid index: ${rem_index} < 0`);
        }
        if (rem_index === 0) {
            this.directions.shift();
        } else if (rem_index === this.directions.length - 1) {
            this.directions.pop();
        }
        this.directions = this.directions.filter((element, index) => rem_index !== index);
    }
    removeHint(rem_index: number) {
        if (rem_index >= this.hints[1].length) {
            throw new RangeError(`Invalid index: ${rem_index} >= ${this.hints[1].length}`);
        } else if (rem_index < 0) {
            throw new RangeError(`Invalid index: ${rem_index} < 0`);
        }
        if (rem_index === 0) {
            this.hints[1].shift();
            this.hints[2].shift();
            this.hints[3].shift();
        } else if (rem_index === this.hints[1].length - 1) {
            this.hints[1].pop();
            this.hints[2].pop();
            this.hints[3].pop();
        } else {
            this.hints[1] = this.hints[1].filter((element, index) => rem_index !== index);
            this.hints[2] = this.hints[2].filter((element, index) => rem_index !== index);
            this.hints[3] = this.hints[3].filter((element, index) => rem_index !== index);
        }
        if(this.hints[1].length === 0) {
            this.hints[0] = false;
        }
    }
    getDirectionByIndex(index: number): Directions {
        return this.directions[index];
    }

    getHintByIndex(index: number): string {
        return this.hints[1][index];
    }
    isHint(): boolean {
        return this.hints[0];
    }
}

export class AdjacentContent {
    up: number;
    left: number;
    right: number;
    down: number;
    diagonalleft: number;
    diagonalright: number;
    diagonalleftup: number;
    diagonalrightup: number;

    constructor(up: number, left: number, right: number, down: number, 
                diagonalleft: number, diagonalright: number, diagonalleftup: number, 
                diagonalrightup: number) {
        this.up = up;
        this.left = left;
        this.right = right;
        this.down = down;
        this.diagonalleft = diagonalleft;
        this.diagonalright = diagonalright;
        this.diagonalleftup = diagonalleftup;
        this.diagonalrightup = diagonalrightup;
    }
}

export class Edges {
    up: number;
    left: number;
    right: number;
    down: number;

    constructor(up: number, left: number, right: number, down: number) {
        this.up = up;
        this.left = left;
        this.right = right;
        this.down = down;
    }

}