const initialScreen = document.getElementById("initialScreen");
const gameScreen = document.getElementById("gameScreen");
const finalScreen = document.getElementById("finalScreen");

const victory = document.getElementById("victory");
const defeat = document.getElementById("defeat");
const waiting = document.getElementById("waiting");
const tie = document.getElementById("tieText");

const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
const teammateDisconnected = document.getElementById("teammateDisconnected");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const helloMsg = document.getElementById("helloMsg");
const gameCode = document.getElementById("gameCode");
const nameInput = document.getElementById("nameInput");
const name = document.getElementById("name");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const players = document.getElementById("players");
const playerOneName = document.getElementById("playerOneName");
const playerTwoName = document.getElementById("playerTwoName");
const playAgainText = document.getElementById("playAgainText");

const playAgain = document.getElementById("playAgain");
const goBackToMainScreen = document.getElementById("goBackToMainScreen");
const playAgainConfirmation = document.getElementById("playAgainConfirmation");
const playAgainDenial = document.getElementById("playAgainDenial");

//TODO Comment the code
newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);
playAgain.addEventListener("click", playAgainRequest);
playAgainConfirmation.addEventListener("click", playAgainConf);
goBackToMainScreen.addEventListener("click", reset);
playAgainDenial.addEventListener("click", reset);
const socket = io("https://connect-4app.herokuapp.com/");
socket.on("init", init);
socket.on("gameCode", handleGameCode);
socket.on("secondPlayerJoined", handleSecondPlayerJoined);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("playerTurn", handlePlayerTurn);
socket.on("victory", handleVictory);
socket.on("defeat", handleDefeat);
socket.on("tie", handleTie);
socket.on("teammateDisconnected", handleTeammateDisconnected);
socket.on("playAgainRequested", handlePlayAgainRequested);
const BG_COLOUR = "#FFFAF0";

let canvas, ctx;
let host;
var img;
let current;
let x = 3 * 90;
let target = 3 * 90;
let down = false;
let state = {};
let gameStarted = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  name.innerText = " " + nameInput.value;
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = 630;
  canvas.height = 551;
  drawBoard();
  canvas.addEventListener("mousemove", mouseMove);
  canvas.addEventListener("mousedown", mouseDown);
  canvas.addEventListener("touchmove", mouseMove);
  canvas.addEventListener("touchend", mouseDown);
}

function drawBoard() {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 70, canvas.width, canvas.height - 70);
  base_image = new Image();
  base_image.src = "pics/Connect4Board.png";
  base_image.onload = function () {
    ctx.drawImage(base_image, 0, 71);
  };
}

function mouseMove(e) {
  var rect = canvas.getBoundingClientRect();

  if (current != null && host != null && current === host) {
    target = Math.floor(Math.abs((e.clientX - rect.left) / 90)) * 90;
  }
}

function mouseDown(e) {
  if (current != null && host != null && current === host) {
    animateDown();
  }
}

function newGame() {
  if (nameInput.value) {
    socket.emit("newGame", nameInput.value);
    gameCode.style.display = "block";
    helloMsg.style.display = "block";
    players.style.display = "none";
  } else {
    alert("Please enter your name");
  }
}

function joinGame() {
  console.log(typeof gameCodeInput.value);
  const code = gameCodeInput.value.toUpperCase();
  nameInput.value
    ? socket.emit("joinGame", code, nameInput.value)
    : alert("Please enter your name");
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  alert("Unknown Game Code");
}

function handleTooManyPlayers() {
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  alert("This game is already in progress");
}

function reset() {
  gameCodeInput.value = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
  player1.classList.remove("turn");
  player2.classList.remove("turn");

  down = true;
  state = {};
  gameStarted = false;
  current = {};
  host = {};
  socket.emit("reset");
  $("#finalScreen").modal("hide");
}

function handleSecondPlayerJoined(opponent) {
  gameCode.style.display = "none";
  helloMsg.style.display = "none";
  host = !opponent.host;
  if (opponent.host) {
    playerOneName.innerText = opponent.name;
    playerTwoName.innerText = nameInput.value;
    player1.classList.add("turn");
  } else {
    playerOneName.innerText = nameInput.value;
    playerTwoName.innerText = opponent.name;
  }
  players.style.display = "flex";
  gameStarted = true;
  $("#finalScreen").modal("hide");
}

function handlePlayerTurn(hostPlayer, s) {
  current = hostPlayer;
  down = false;
  if (s.latestMove) {
    let oldMove = new Image();
    host
      ? (oldMove.src = "./pics/yellowChip.png")
      : (oldMove.src = "./pics/redChip.png");
    ctx.drawImage(
      oldMove,
      15 + s.latestMove[0] * 90,
      -3 + 80 * (6 - s.latestMove[1]),
      70,
      70
    );
  }
  if (host) {
    player1.classList.add("turn");
    player2.classList.remove("turn");
    img = new Image();
    img.onload = animate;
    img.src = "./pics/redChip.png"; // load image
  } else {
    player2.classList.add("turn");
    player1.classList.remove("turn");
    img = new Image();
    img.onload = animate;
    img.src = "./pics/yellowChip.png"; // load image
  }
  state = s;
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, 70); // clear canvas
  !down && gameStarted ? ctx.drawImage(img, 15 + x, 0, 70, 70) : null; // draw image at current position
  if (x < target) {
    x += 30;
    requestAnimationFrame(animate);
  } else if (x > target) {
    x -= 30;
    requestAnimationFrame(animate);
  } else {
    requestAnimationFrame(animate);
  }
}

function animateDown() {
  if (gameStarted && state.cols[target / 90] != 6) {
    down = true;
    ctx.clearRect(0, 0, canvas.width, 70); // clear canvas
    ctx.drawImage(
      img,
      15 + target,
      -3 + 80 * (6 - state.cols[target / 90]),
      70,
      70
    );
    var audio = new Audio("https://www.w3schools.com/graphics/bounce.mp3");
    audio.play();
    socket.emit("played", [target / 90, state.cols[target / 90]]);
    if (host) {
      player2.classList.add("turn");
      player1.classList.remove("turn");
    } else {
      player1.classList.add("turn");
      player2.classList.remove("turn");
    }
  }
}

function handleDefeat(s) {
  let oldMove = new Image();
  host
    ? (oldMove.src = "./pics/yellowChip.png")
    : (oldMove.src = "./pics/redChip.png");
  ctx.drawImage(
    oldMove,
    15 + s.latestMove[0] * 90,
    -3 + 80 * (6 - s.latestMove[1]),
    70,
    70
  );
  $("#finalScreen").modal("show");
  defeat.style.display = "block";
  tie.style.display = "none";
  waiting.style.display = "none";
  victory.style.display = "none";
  teammateDisconnected.style.display = "none";
  playAgainText.style.display = "none";

  playAgain.style.display = "block";
  playAgainDenial.style.display = "none";
  playAgainConfirmation.style.display = "none";
  goBackToMainScreen.style.display = "block";

  gameStarted = false;
  console.log("you lost :(");
}

function handleVictory() {
  $("#finalScreen").modal("show");
  victory.style.display = "block";
  defeat.style.display = "none";
  tie.style.display = "none";
  waiting.style.display = "none";
  teammateDisconnected.style.display = "none";
  playAgainText.style.display = "none";

  playAgain.style.display = "block";
  playAgainDenial.style.display = "none";
  playAgainConfirmation.style.display = "none";
  goBackToMainScreen.style.display = "block";

  gameStarted = false;
  console.log("VICTORY!");
}

function handleTie(s) {
  let oldMove = new Image();
  host
    ? (oldMove.src = "./pics/yellowChip.png")
    : (oldMove.src = "./pics/redChip.png");
  ctx.drawImage(
    oldMove,
    15 + s.latestMove[0] * 90,
    -3 + 80 * (6 - s.latestMove[1]),
    70,
    70
  );
  $("#finalScreen").modal("show");
  defeat.style.display = "none";
  tie.style.display = "block";
  waiting.style.display = "none";
  victory.style.display = "none";
  teammateDisconnected.style.display = "none";
  playAgainText.style.display = "none";

  playAgain.style.display = "block";
  playAgainDenial.style.display = "none";
  playAgainConfirmation.style.display = "none";
  goBackToMainScreen.style.display = "block";

  gameStarted = false;
}

function handleTeammateDisconnected() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear canvas
  drawBoard();
  $("#finalScreen").modal("show");
  victory.style.display = "none";
  defeat.style.display = "none";
  tie.style.display = "none";
  waiting.style.display = "none";
  playAgainText.style.display = "none";
  teammateDisconnected.style.display = "block";
  gameCode.style.display = "block";
  helloMsg.style.display = "block";
  players.style.display = "none";

  playAgain.style.display = "none";
  playAgainDenial.style.display = "none";
  playAgainConfirmation.style.display = "none";
  goBackToMainScreen.style.display = "block";

  host = true;
  current = null;
  state = {};
  down = false;
  gameStarted = false;
}

function playAgainRequest() {
  socket.emit("playAgain", host);

  victory.style.display = "none";
  defeat.style.display = "none";
  tie.style.display = "none";
  waiting.style.display = "block";
  playAgainText.style.display = "none";
  teammateDisconnected.style.display = "none";

  playAgain.style.display = "none";
  playAgainDenial.style.display = "none";
  playAgainConfirmation.style.display = "none";
  goBackToMainScreen.style.display = "none";
}

function handlePlayAgainRequested() {
  $("#finalScreen").modal("show");
  victory.style.display = "none";
  tie.style.display = "none";
  defeat.style.display = "none";
  waiting.style.display = "none";
  playAgainText.style.display = "block";
  teammateDisconnected.style.display = "none";

  playAgain.style.display = "none";
  playAgainDenial.style.display = "block";
  playAgainConfirmation.style.display = "block";
  goBackToMainScreen.style.display = "none";
}

function playAgainConf() {
  socket.emit("playAgainConf");
}
// npx live-server to run frontend
// npx nodemon server.js to run backend
