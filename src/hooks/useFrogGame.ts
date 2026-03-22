import { useState, useCallback, useEffect } from 'react';
import { FrogType, GameState } from '../types';

export const useFrogGame = (initialFrogCount: number) => {
  const createInitialBoard = (count: number): FrogType[] => {
    const reds = Array(count).fill(FrogType.RED);
    const greens = Array(count).fill(FrogType.GREEN);
    return [...reds, FrogType.EMPTY, ...greens];
  };

  const [state, setState] = useState<GameState>({
    board: createInitialBoard(initialFrogCount),
    moves: 0,
    history: [],
    isLocked: false,
    isSolved: false,
    frogCount: initialFrogCount,
  });

  const reset = useCallback((count?: number) => {
    const newCount = count ?? state.frogCount;
    setState({
      board: createInitialBoard(newCount),
      moves: 0,
      history: [],
      isLocked: false,
      isSolved: false,
      frogCount: newCount,
    });
  }, [state.frogCount]);

  const checkSolved = (board: FrogType[], count: number): boolean => {
    const reds = board.slice(count + 1);
    const greens = board.slice(0, count);
    const empty = board[count];
    
    return (
      reds.every(f => f === FrogType.RED) &&
      greens.every(f => f === FrogType.GREEN) &&
      empty === FrogType.EMPTY
    );
  };

  const checkLocked = (board: FrogType[]): boolean => {
    for (let i = 0; i < board.length; i++) {
      const frog = board[i];
      if (frog === FrogType.EMPTY) continue;

      // Check if this frog can move
      if (frog === FrogType.RED) {
        // Slide right
        if (i + 1 < board.length && board[i + 1] === FrogType.EMPTY) return false;
        // Jump right
        if (i + 2 < board.length && board[i + 1] !== FrogType.EMPTY && board[i + 2] === FrogType.EMPTY) return false;
      } else {
        // Slide left
        if (i - 1 >= 0 && board[i - 1] === FrogType.EMPTY) return false;
        // Jump left
        if (i - 2 >= 0 && board[i - 1] !== FrogType.EMPTY && board[i - 2] === FrogType.EMPTY) return false;
      }
    }
    return true;
  };

  const move = (index: number) => {
    if (state.isSolved || state.isLocked) return;

    const frog = state.board[index];
    if (frog === FrogType.EMPTY) return;

    let targetIndex = -1;
    let isIllegal = false;

    if (frog === FrogType.RED) {
      if (index + 1 < state.board.length && state.board[index + 1] === FrogType.EMPTY) {
        targetIndex = index + 1;
      } else if (index + 2 < state.board.length && state.board[index + 2] === FrogType.EMPTY) {
        targetIndex = index + 2;
      } else {
        isIllegal = true;
      }
    } else {
      if (index - 1 >= 0 && state.board[index - 1] === FrogType.EMPTY) {
        targetIndex = index - 1;
      } else if (index - 2 >= 0 && state.board[index - 2] === FrogType.EMPTY) {
        targetIndex = index - 2;
      } else {
        isIllegal = true;
      }
    }

    if (isIllegal) {
      // Optional: Add a shake effect or toast
      console.log("Otillåtet drag: Grodan kan inte flytta dit.");
      return;
    }

    if (targetIndex !== -1) {
      const newBoard = [...state.board];
      newBoard[targetIndex] = frog;
      newBoard[index] = FrogType.EMPTY;

      const solved = checkSolved(newBoard, state.frogCount);
      const locked = !solved && checkLocked(newBoard);

      setState(prev => ({
        ...prev,
        board: newBoard,
        moves: prev.moves + 1,
        history: [...prev.history, prev.board],
        isSolved: solved,
        isLocked: locked,
      }));
    }
  };

  const undo = () => {
    if (state.history.length === 0) return;
    const previousBoard = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    
    setState(prev => ({
      ...prev,
      board: previousBoard,
      moves: prev.moves - 1,
      history: newHistory,
      isSolved: false,
      isLocked: false,
    }));
  };

  const getNextBestMove = (): number | null => {
    const targetBoard = [...Array(state.frogCount).fill(FrogType.GREEN), FrogType.EMPTY, ...Array(state.frogCount).fill(FrogType.RED)];
    
    const serialize = (b: FrogType[]) => b.join(',');
    const targetStr = serialize(targetBoard);
    
    const queue: { board: FrogType[], firstMove: number }[] = [];
    const visited = new Set<string>();

    // Get all possible first moves from current state
    for (let i = 0; i < state.board.length; i++) {
      const frog = state.board[i];
      if (frog === FrogType.EMPTY) continue;

      const possibleTargets = [];
      if (frog === FrogType.RED) {
        if (i + 1 < state.board.length && state.board[i + 1] === FrogType.EMPTY) possibleTargets.push(i + 1);
        if (i + 2 < state.board.length && state.board[i + 2] === FrogType.EMPTY) possibleTargets.push(i + 2);
      } else {
        if (i - 1 >= 0 && state.board[i - 1] === FrogType.EMPTY) possibleTargets.push(i - 1);
        if (i - 2 >= 0 && state.board[i - 2] === FrogType.EMPTY) possibleTargets.push(i - 2);
      }

      for (const target of possibleTargets) {
        const nextBoard = [...state.board];
        nextBoard[target] = frog;
        nextBoard[i] = FrogType.EMPTY;
        queue.push({ board: nextBoard, firstMove: i });
      }
    }

    // BFS to find if any of these moves lead to solution
    while (queue.length > 0) {
      const { board, firstMove } = queue.shift()!;
      const s = serialize(board);
      if (s === targetStr) return firstMove;
      if (visited.has(s)) continue;
      visited.add(s);

      // Try all moves from this board
      for (let i = 0; i < board.length; i++) {
        const frog = board[i];
        if (frog === FrogType.EMPTY) continue;

        const possibleTargets = [];
        if (frog === FrogType.RED) {
          if (i + 1 < board.length && board[i + 1] === FrogType.EMPTY) possibleTargets.push(i + 1);
          if (i + 2 < board.length && board[i + 2] === FrogType.EMPTY) possibleTargets.push(i + 2);
        } else {
          if (i - 1 >= 0 && board[i - 1] === FrogType.EMPTY) possibleTargets.push(i - 1);
          if (i - 2 >= 0 && board[i - 2] === FrogType.EMPTY) possibleTargets.push(i - 2);
        }

        for (const target of possibleTargets) {
          const nextBoard = [...board];
          nextBoard[target] = frog;
          nextBoard[i] = FrogType.EMPTY;
          queue.push({ board: nextBoard, firstMove });
        }
      }
    }

    return null;
  };

  const autoMove = () => {
    const nextMoveIndex = getNextBestMove();
    if (nextMoveIndex !== null) {
      move(nextMoveIndex);
    } else {
      // If no solution from current state, reset and perform first move
      reset();
      // We can't immediately move because state update is async, 
      // but we can signal that we need a hint.
      // For simplicity, let's just alert the user to reset.
      return false;
    }
    return true;
  };

  return { state, move, undo, reset, autoMove };
};
