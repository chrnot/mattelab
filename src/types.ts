export enum Lab {
  HOME = 'HOME',
  FROG_JUMP = 'FROG_JUMP',
  MAGIC_SQUARE = 'MAGIC_SQUARE',
  GEOBOARD = 'GEOBOARD'
}

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
  GENERALIZATION = 'GENERALIZATION',
  CHALLENGE = 'CHALLENGE',
  MODUL_1 = 'MODUL_1',
  MODUL_2 = 'MODUL_2',
  MODUL_3 = 'MODUL_3',
  MODUL_4 = 'MODUL_4'
}

export interface ResultEntry {
  frogCount: number;
  minMoves: number;
}

export interface MagicSquareState {
  grid: (number | null)[];
  availableNumbers: number[];
  targetSum: number;
  phase: Phase;
}
