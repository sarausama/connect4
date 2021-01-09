module.exports = {
  createGameState,
  didWin,
};

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
