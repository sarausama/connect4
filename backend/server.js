var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const { makeid } = require("./utils");
const { createGameState, didWin, didTie } = require("./game");
let clientRooms = {};
let clients = {};
let state = {};

var PORT = process.env.PORT || 3000;

io.on("connection", (client) => {
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("disconnect", handleDisconnect);
  client.on("played", handleSwitchTurn);
  client.on("playAgain", handlePlayAgainRequest);
  client.on("playAgainConf", handlePlayAgainConfirmation);
  client.on("reset", reset);

  //function that gets called when the client joins a game
  function handleJoinGame(roomName, name) {
    let numClients;
    //gets the number of players in that room
    clients[roomName]
      ? (numClients = clients[roomName].players.length)
      : (numClients = 0);

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }
    let secondPlayer = {
      id: client.id,
      name: name,
      host: false,
    };

    //contacts the host and lets them know that their opponent has joined the game
    io.to(clients[roomName].players[0].id).emit(
      "secondPlayerJoined",
      secondPlayer
    );
    clients[roomName].players.push(secondPlayer);
    clientRooms[client.id] = roomName;

    //contacts the client and lets them into the room
    client.emit("gameCode", roomName);
    client.join(roomName);
    client.emit("init");
    io.to(clients[roomName].players[1].id).emit(
      "secondPlayerJoined",
      clients[roomName].players[0]
    );
    //creates the state of the room
    state[roomName] = createGameState();

    //contacts the host and let them know that it's their turn
    io.to(clients[roomName].players[0].id).emit(
      "playerTurn",
      clients[roomName].players[0].host,
      state[roomName]
    );
  }

  //function that gets called when the client creates a room
  function handleNewGame(name) {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;

    clients[roomName] = {
      players: [
        {
          id: client.id,
          name: name,
          host: true,
        },
      ],
    };
    client.emit("gameCode", roomName);
    client.join(roomName);
    client.emit("init");
  }

  //function that gets called when the player gets disconnected
  function handleDisconnect() {
    console.log("player with id " + client.id + " got disconnected");
    let roomCode = clientRooms[client.id];
    if (roomCode) {
      let flag;
      for (var i = 0; i < clients[roomCode].players.length; i++) {
        if (clients[roomCode].players[i].id === client.id) {
          flag = i;
        } else {
          if (!clients[roomCode].players[i].host) {
            clients[roomCode].players[i].host = true;
          }
        }
      }
      clients[roomCode].players.splice(flag, 1);
      if (clients[roomCode].players.length === 1) {
        io.to(clients[roomCode].players[0].id).emit("teammateDisconnected");
      } else {
        delete clients[roomCode];
      }
    }
    delete clientRooms[client.id];
  }

  //function that gets called when the client plays a move
  function handleSwitchTurn(latestMove) {
    let roomName = clientRooms[client.id];
    state[roomName].latestMove = latestMove;
    state[roomName].turn = state[roomName].turn === 0 ? 1 : 0;
    state[roomName].gameBoard[latestMove[0]][latestMove[1]] =
      state[roomName].turn === 0 ? 1 : 0;
    state[roomName].cols[latestMove[0]] =
      state[roomName].cols[latestMove[0]] + 1;
    if (didWin(state[roomName])) {
      io.to(clients[roomName].players[state[roomName].turn].id).emit(
        "defeat",
        state[roomName]
      );
      io.to(
        clients[roomName].players[state[roomName].turn === 0 ? 1 : 0].id
      ).emit("victory");
      delete state[roomName];
    } else if (didTie(state[roomName])) {
      io.to(clients[roomName].players[state[roomName].turn].id).emit(
        "tie",
        state[roomName]
      );
      io.to(
        clients[roomName].players[state[roomName].turn === 0 ? 1 : 0].id
      ).emit("tie", state[roomName]);
      delete state[roomName];
    } else {
      io.to(clients[roomName].players[state[roomName].turn].id).emit(
        "playerTurn",
        clients[roomName].players[state[roomName].turn].host,
        state[roomName]
      );
    }
  }

  //function that gets called when the client requests to play again
  function handlePlayAgainRequest(host) {
    let roomName = clientRooms[client.id];
    let num;
    host ? (num = 1) : (num = 0);
    io.to(clients[roomName].players[num].id).emit("playAgainRequested");
  }

  //functtion that gets called when the client confirms that they want to play again
  function handlePlayAgainConfirmation() {
    let roomName = clientRooms[client.id];
    io.to(clients[roomName].players[0].id).emit(
      "secondPlayerJoined",
      clients[roomName].players[1]
    );
    io.to(clients[roomName].players[1].id).emit(
      "secondPlayerJoined",
      clients[roomName].players[0]
    );
    io.to(clients[roomName].players[0].id).emit("init");
    io.to(clients[roomName].players[1].id).emit("init");
    state[roomName] = createGameState();
    io.to(clients[roomName].players[0].id).emit(
      "playerTurn",
      clients[roomName].players[0].host,
      state[roomName]
    );
  }

  //function that gets called when the client returns to the main screen
  function reset() {
    let roomName = clientRooms[client.id];
    if (clients[roomName].players.length === 2) {
      if (clients[roomName].players[0].id === client.id) {
        io.to(clients[roomName].players[1].id).emit("teammateDisconnected");
      } else {
        io.to(clients[roomName].players[0].id).emit("teammateDisconnected");
      }
      for (var i = 0; i < clients[roomName].players.length; i++) {
        if (clients[roomName].players[i].id === client.id) {
          flag = i;
        } else {
          if (!clients[roomName].players[i].host) {
            clients[roomName].players[i].host = true;
          }
        }
      }
      clients[roomName].players.splice(flag, 1);
    } else {
      delete clients[roomName];
    }
    delete clientRooms[client.id];
  }
});

http.listen(PORT, () => {
  console.log("listening on *:3000");
});
