const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/message");
const { isRealString } = require("./utils/validation");
const { Users } = require("./utils/users");

const publicPath = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
const app = express();
// app.listen is equivalent to server.listen, I made this change to make the server use socketIO, because with app it's not possible
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

app.use(express.static(publicPath)); // express static middleware

// * listen to the connection event
// ? the events connection and disconnect are built-in events
io.on("connection", socket => {
	console.log("new client connected");

	// ? io.emit = emit to all the connections
	// ? socket.broadcast.emit = to everyone, expect the use socket
	// ? socket.on or io.on = listening to some event
	// ? socket.emit = emit to a single connection
	// ? io.to('room name').emit && socket.broadcast.to('room name').emit are used to send msg to a specific room

	socket.on("join", (params, callback) => {
		if (!isRealString(params.name) || !isRealString(params.room)) {
			return callback("Name and room name are required");
		}

		socket.join(params.room);
		users.removeUser(socket.id);
		users.addUser(socket.id, params.name, params.room);
		// socket.leave(params.room)

		io.to(params.room).emit(
			"updateUserList",
			users.getUserList(params.room)
		);

		// ! newMessage: server emit event -> client listen for event
		socket.emit(
			"newMessage",
			generateMessage("Admin", "Welcome to the chat app")
		);

		// ! newMessage: server broadcast event (to room) -> client listen for event (in the room)
		socket.broadcast
			.to(params.room)
			.emit(
				"newMessage",
				generateMessage("Admin", `${params.name} has joined`)
			);

		callback();
	});

	// * listen to the createMessage event
	// ! createMessage: client emit event -> server listen for event
	socket.on("createMessage", (message, callback) => {
		var user = users.getUser(socket.id);

		if (user && isRealString(message.text)) {
			io.to(user.room).emit(
				"newMessage",
				generateMessage(user.name, message.text)
			);
		}

		callback();
	});

	// * listen to the createLocationMessage event
	// ! createLocationMessage: client emit event -> server listen for event
	socket.on("createLocationMessage", coords => {
		var user = users.getUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				"newLocationMessage",
				generateLocationMessage(
					user.name,
					coords.latitude,
					coords.longitude
				)
			);
		}
	});

	// * listen to the disconnect event
	socket.on("disconnect", () => {
		console.log("a client disconnected");

		var user = users.removeUser(socket.id);

		if (user) {
			io.to(user.room).emit(
				"updateUserList",
				users.getUserList(user.room)
			);
			io.to(user.room).emit(
				"newMessage",
				generateMessage("Admin", `${user.name} has left`)
			);
		}
	});

	/*
		* creating the event
		! from the server to the client
		socket.emit("newEmail", generateMessage("mike@example.com", "hey"));

		! from the client to the server
		socket.on("createEmail", newEmail => {
			console.log("createEmail", newEmail);
		});
	*/

	/*
		socket.emit("newMessage", generateMessage("John", "See you"));
	*/
});

// express use http, when we call app.listen in the background it's calling http.createServer
server.listen(port, function() {
	console.log(`app listening on port ${port}!`);
});
