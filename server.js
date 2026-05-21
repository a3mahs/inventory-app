const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('[Socket.io] Client connected:', socket.id);
    socket.join('inventory');

    socket.on('product:updated', (data) => {
      socket.broadcast.to('inventory').emit('product:updated', data);
    });

    socket.on('stock:adjusted', (data) => {
      io.to('inventory').emit('stock:adjusted', data);
    });

    socket.on('alert:mark-read', (alertId) => {
      socket.broadcast.to('inventory').emit('alert:marked-read', alertId);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] Client disconnected:', socket.id, reason);
    });
  });

  // Make io globally accessible for API routes
  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV || 'development'}`);
    });
});
