export enum FrogType {
  RED = 'RED',
  GREEN = 'GREEN',
  EMPTY = 'EMPTY'
}

export interface GameState {
  board: FrogType[];
  moves: number;
  history: FrogType[][];
  isLocked: boolean;
  isSolved: boolean;
  frogCount: number; // Number of frogs per family
}

export enum Phase {
  EXPLORATION = 'EXPLORATION',
  PREDICTION = 'PREDICTION',
  ABSTRACT_LEAP = 'ABSTRACT_LEAP',
  GENERALIZATION = 'GENERALIZATION'
}

export interface ResultEntry {
  frogCount: number;
  minMoves: number;
}
