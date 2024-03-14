import { Directions } from './enums';

export class Cell {
    private content: number;
    private column: number;
    private row: number;
    private hints: [boolean, string[]];
    private directions: Directions[];

    constructor(content: number, column: number, row: number) {
        this.content = content;
        this.column = column;
        this.row = row;
        this.hints = [false, []];
        this.directions = [];
    }

    reInit() {
        this.hints = [false, []],
        this.directions = [];
        this.content = -1;
    }

    setContent(new_content: number) {
        this.content = new_content;
    }

    setHint(new_hint: string) {
        this.hints[0] = true;
        this.hints[1].push(new_hint);
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
        } else if (rem_index === this.hints[1].length - 1) {
            this.hints[1].pop();
        }
        this.hints[1] = this.hints[1].filter((element, index) => rem_index !== index);
        if(this.hints[1].length === 0) {
            this.hints[0] = false;
        }
    }

    getContent(): number {
        return this.content;
    }

    getDirections(): Directions[] {
        return this.directions;
    }

    getDirection(index: number): Directions {
        return this.directions[index];
    }

    getHint(index: number): string {
        return this.hints[1][index];
    }

    getHints(): string[] {
        return this.hints[1];
    }

    isHint(): boolean {
        return this.hints[0];
    }
}