
export enum Table {
    Words, 
    Occurences, 
    Hints
}

export const enum Directions {
    Left = 2,
    Right,
    Down,
    Up,
    DiagonalLeft,
    DiagonalRightUp,
    DiagonalRight,
    DiagonalLeftUp
}

export const enum Parameters {
    Direction,
    Periphery
}

export const enum ColRow {
    Empty = -1,
    Column,
    Row
}

export const enum ID {
    Empty = -1,
    Hint,
    Word
}