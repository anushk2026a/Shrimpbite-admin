import { io } from "socket.io-client";

<<<<<<< HEAD
const SOCKET_URL = "https://shrimpbite-socket-server.onrender.com";
=======
// const SOCKET_URL = "https://shrimpbite-socket-server.onrender.com";
const SOCKET_URL = "http://localhost:5001";
>>>>>>> 68f6adcd2fddf46b469c1144be205b4b3b4be29d

const socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    transports: ["websocket"]
});

export default socket;