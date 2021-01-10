module.exports = {
  createGameState,
  didWin,
  didTie,
};

//function that creates the game state when the game starts
function createGameState() {
  return {
    latestMove: [],
    gameBoard: [
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
      [2, 2, 2, 2, 2, 2],
    ],
    turn: 0,
    cols: [0, 0, 0, 0, 0, 0, 0],
  };
}

//function that checks if the player won the game (based on their last move)
function didWin(state) {
  if (checkDown(state)) {
    return true;
  }
  if (checkRow(state)) {
    return true;
  }
  if (checkDiagonal(state)) {
    return true;
  }
  return false;
}

//function that checks if the game ended in a tie (checks if the board is full)
function didTie(state) {
  for (let i = 0; i < state.cols.length; ++i) {
    if (state.cols[i] != 6) {
      return false;
    }
  }
  return true;
}

//function that checks if the player won by putting 4 chips on top of each others
function checkDown(state) {
  if (state.cols[state.latestMove[0]] < 4) {
    return false;
  }
  for (let i = state.latestMove[1]; i > state.latestMove[1] - 4; --i) {
    if (state.gameBoard[state.latestMove[0]][i] === state.turn) {
      return false;
    }
  }
  return true;
}

//function that checks if the player won by having 4 chips next to each others on the same row
function checkRow(state) {
  let num = 1;
  let x = state.latestMove[0];
  let y = state.latestMove[1];
  let played = state.turn === 0 ? 1 : 0;
  if (x !== 6) {
    for (let i = x + 1; i < Math.min(x + 4, 7); ++i) {
      if (state.gameBoard[i][y] === played) {
        ++num;
      } else {
        break;
      }
    }
  }
  if (x !== 0) {
    for (let i = x - 1; i > Math.max(x - 4, -1); --i) {
      if (state.gameBoard[i][y] === played) {
        ++num;
      } else {
        break;
      }
    }
  }
  if (num > 3) {
    return true;
  } else {
    return false;
  }
}

//function that checks if the player won by having 4 in a row in a diagonal
function checkDiagonal(state) {
  let num = 1;
  let x = state.latestMove[0];
  let y = state.latestMove[1];
  let played = state.turn === 0 ? 1 : 0;
  if (x !== 0 && y !== 0) {
    for (let i = x - 1; i > Math.max(x - 4, -1); --i) {
      if (y - (x - i) > -1 && state.gameBoard[i][y - (x - i)] === played) {
        ++num;
      } else {
        break;
      }
    }
  }

  if (x !== 6 && y !== 5) {
    for (let i = x + 1; i < Math.min(x + 4, 7); ++i) {
      if (y - (x - i) < 6 && state.gameBoard[i][y - (x - i)] === played) {
        ++num;
      } else {
        break;
      }
    }
  }
  if (num > 3) {
    return true;
  } else {
    num = 1;
    if (x !== 0 && y !== 5) {
      for (let i = x - 1; i > Math.max(x - 4, -1); --i) {
        if (y + (x - i) < 6 && state.gameBoard[i][y + (x - i)] === played) {
          ++num;
        } else {
          break;
        }
      }
    }

    if (x !== 6 && y !== 0) {
      for (let i = x + 1; i < Math.min(x + 4, 7); ++i) {
        if (y + (x - i) > -1 && state.gameBoard[i][y + (x - i)] === played) {
          ++num;
        } else {
          break;
        }
      }
    }
    if (num > 3) {
      return true;
    } else {
      return false;
    }
  }
}
