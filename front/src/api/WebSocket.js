import { io } from 'https://cdn.socket.io/4.5.4/socket.io.esm.min.js'

export const WebSocket = io(import.meta.env.VITE_WEBSOCKET_URL, {
  withCredentials: true,
  path: '/notifications',
  autoConnect: false,
})
