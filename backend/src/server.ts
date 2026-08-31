import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import { setupSocketIO } from './socket/index.js';

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

// Setup Socket.IO
setupSocketIO(server);

server.listen(PORT, () => {
  console.log(`Vibely backend server running on port ${PORT}`);
});
