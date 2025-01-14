import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import SplashCursor from './SplashCursor'; // Re-add this line

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isGameOver, setIsGameOver] = useState(false);
  const [isComputerMoving, setIsComputerMoving] = useState(false);
  const [scores, setScores] = useState({
    player: 0,
    tie: 0,
    computer: 0
  });
  const [gameMode, setGameMode] = useState('player-vs-computer'); // New state for game mode
  const [currentPlayer, setCurrentPlayer] = useState('X'); // New state for current player

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (currentBoard) => {
    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (currentBoard[a] && 
          currentBoard[a] === currentBoard[b] && 
          currentBoard[a] === currentBoard[c]) {
        return currentBoard[a];
      }
    }
    return null;
  };

  const isBoardFull = (currentBoard) => {
    return currentBoard.every(cell => cell !== null);
  };

  const computerMove = (currentBoard) => {
    // First try to win
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const boardCopy = [...currentBoard];
        boardCopy[i] = 'O';
        if (checkWinner(boardCopy) === 'O') {
          return i;
        }
      }
    }

    // Then block player from winning
    for (let i = 0; i < 9; i++) {
      if (!currentBoard[i]) {
        const boardCopy = [...currentBoard];
        boardCopy[i] = 'X';
        if (checkWinner(boardCopy) === 'X') {
          return i;
        }
      }
    }

    // Try to take center
    if (!currentBoard[4]) return 4;

    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => !currentBoard[i]);
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }

    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => !currentBoard[i]);
    if (availableSides.length > 0) {
      return availableSides[Math.floor(Math.random() * availableSides.length)];
    }

    return -1;
  };

  const handleCellClick = (index) => {
    if (board[index] || isGameOver || (gameMode === 'player-vs-computer' && isComputerMoving)) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      handleGameEnd(winner);
      return;
    }

    if (isBoardFull(newBoard)) {
      handleGameEnd(null);
      return;
    }

    if (gameMode === 'player-vs-computer') {
      // Computer's turn
      setIsComputerMoving(true);
      const computerIndex = computerMove(newBoard);
      if (computerIndex !== -1) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            newBoard[computerIndex] = 'O';
            setBoard(newBoard);

            const finalWinner = checkWinner(newBoard);
            if (finalWinner) {
              handleGameEnd(finalWinner);
              return;
            }

            if (isBoardFull(newBoard)) {
              handleGameEnd(null);
            }
            setIsComputerMoving(false);
          }, 500);
        });
      }
    } else {
      // Player vs Player mode
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const handleGameEnd = (winner) => {
    setIsGameOver(true);
    if (winner === 'X') {
      setScores(prev => ({ ...prev, player: prev.player + 1 }));
    } else if (winner === 'O') {
      setScores(prev => ({ ...prev, computer: prev.computer + 1 }));
    } else {
      setScores(prev => ({ ...prev, tie: prev.tie + 1 }));
    }
    setTimeout(() => {
      setBoard(Array(9).fill(null));
      setIsGameOver(false);
      setCurrentPlayer('X'); // Reset current player
    }, 1500);
  };

  const Cell = ({ value, onClick, index }) => {
    let borderClasses = "border-white ";
    if (index < 3) borderClasses += "border-t-0 "; // top row
    if (index > 5) borderClasses += "border-b-0 "; // bottom row
    if (index % 3 === 0) borderClasses += "border-l-0 "; // left column
    if (index % 3 === 2) borderClasses += "border-r-0 "; // right column

    return (
      <div
        onClick={onClick}
        className={`w-full h-full flex items-center justify-center cursor-pointer border-gray-800 border-2 ${borderClasses}`}
      >
        {value && (
          <span className="text-white text-4xl font-bold">
            {value}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <SplashCursor /> {/* Ensure this line is inside a div with absolute positioning */}
      </div>
      {/* Game mode selection */}
      <div className="mb-4 flex space-x-4 z-10">
        <button
          className={`px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${gameMode === 'player-vs-computer' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white`}
          onClick={() => setGameMode('player-vs-computer')}
        >
          Player vs Computer
        </button>
        <button
          className={`px-6 py-3 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${gameMode === 'player-vs-player' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gradient-to-r from-gray-500 to-gray-700'} text-white`}
          onClick={() => setGameMode('player-vs-player')}
        >
          Player vs Player
        </button>
      </div>

      {/* Game board */}
      <div className="w-96 h-96 bg-slate-400 grid grid-cols-3 grid-rows-3 z-10">
        {board.map((cell, index) => (
          <Cell 
            key={index}
            value={cell}
            index={index}
            onClick={() => handleCellClick(index)}
          />
        ))}
      </div>

      {/* Score display */}
      <div className="mt-8 flex items-center justify-center space-x-16 text-white z-10">
        <div className="flex flex-col items-center">
          <div className="text-sm mb-2">PLAYER (×)</div>
          <div className="text-4xl">{scores.player}</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-sm mb-2">TIE</div>
          <div className="text-4xl">{scores.tie}</div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-sm mb-2">COMPUTER (O)</div>
          <div className="text-4xl">{scores.computer}</div>
        </div>

        <div className="flex flex-col items-center ml-4">
          <User className="text-gray-500" size={24} />
          <div className="text-gray-500 text-sm">1P</div>
        </div>
        
      </div>
      
    </div>
  );
};

export default TicTacToe;