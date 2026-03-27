import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthSocket extends Socket {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

interface ConnectionInfo {
  socket: AuthSocket;
  connectedAt: Date;
  lastActivity: Date;
  rooms: Set<string>;
}

export class SocketServer {
  private static instance: SocketServer;
  private io: Server;
  private connections: Map<string, ConnectionInfo> = new Map();
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> socketIds
  private readonly MAX_CONNECTIONS_PER_USER = 5;
  private readonly CONNECTION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  private constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      transports: ['websocket', 'polling'],
      maxHttpBufferSize: 1e6 // 1 MB
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startCleanupInterval();
  }

  public static getInstance(httpServer?: HttpServer): SocketServer {
    if (!SocketServer.instance && httpServer) {
      SocketServer.instance = new SocketServer(httpServer);
    }
    return SocketServer.instance;
  }

  public static getIO(): Server {
    if (!SocketServer.instance) {
      throw new Error('SocketServer not initialized. Call getInstance(httpServer) first.');
    }
    return SocketServer.instance.io;
  }

  private setupMiddleware() {
    this.io.use((socket: AuthSocket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        const secret = process.env.JWT_SECRET || 'default_secret';
        const decoded = jwt.verify(token, secret) as any;
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthSocket) => {
      if (!socket.user?.id) {
        socket.disconnect();
        return;
      }

      // Check connection limits
      const userConnections = this.userSockets.get(socket.user.id) || new Set();
      if (userConnections.size >= this.MAX_CONNECTIONS_PER_USER) {
        console.warn(`⚠️ User ${socket.user.id} exceeded connection limit`);
        socket.emit('error', { message: 'Too many connections' });
        socket.disconnect();
        return;
      }

      // Track connection
      const connectionInfo: ConnectionInfo = {
        socket,
        connectedAt: new Date(),
        lastActivity: new Date(),
        rooms: new Set()
      };

      this.connections.set(socket.id, connectionInfo);
      
      // Track user sockets
      if (!this.userSockets.has(socket.user.id)) {
        this.userSockets.set(socket.user.id, new Set());
      }
      this.userSockets.get(socket.user.id)!.add(socket.id);

      console.log(`🔌 User connected: ${socket.user.id} (${socket.id}) - Total: ${this.connections.size}`);

      // Join user-specific room for private notifications
      const userRoom = `user_${socket.user.id}`;
      socket.join(userRoom);
      connectionInfo.rooms.add(userRoom);
      console.log(`👤 User ${socket.user.id} joined room: ${userRoom}`);

      // Handle client-side events
      socket.on('ping', () => {
        connectionInfo.lastActivity = new Date();
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle custom events and update activity
      socket.onAny((eventName, ...args) => {
        connectionInfo.lastActivity = new Date();
      });

      socket.on('disconnect', (reason) => {
        this.handleDisconnect(socket, reason);
      });

      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.user?.id}:`, error);
        this.handleDisconnect(socket, 'error');
      });
    });
  }

  private handleDisconnect(socket: AuthSocket, reason: string) {
    if (!socket.user?.id) return;

    const connectionInfo = this.connections.get(socket.id);
    if (!connectionInfo) return;

    // Clean up all rooms the socket was in
    connectionInfo.rooms.forEach(room => {
      socket.leave(room);
    });

    // Remove from connections
    this.connections.delete(socket.id);

    // Remove from user sockets
    const userSockets = this.userSockets.get(socket.user.id);
    if (userSockets) {
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        this.userSockets.delete(socket.user.id);
      }
    }

    console.log(`❌ User disconnected: ${socket.user.id} (${reason}) - Remaining: ${this.connections.size}`);
  }

  private startCleanupInterval() {
    // Clean up inactive connections every 5 minutes
    setInterval(() => {
      const now = new Date();
      const inactiveConnections: string[] = [];

      this.connections.forEach((connectionInfo, socketId) => {
        const inactiveTime = now.getTime() - connectionInfo.lastActivity.getTime();
        if (inactiveTime > this.CONNECTION_TIMEOUT) {
          inactiveConnections.push(socketId);
        }
      });

      inactiveConnections.forEach(socketId => {
        const connectionInfo = this.connections.get(socketId);
        if (connectionInfo) {
          console.log(`🧹 Cleaning up inactive connection: ${connectionInfo.socket.user?.id} (${socketId})`);
          connectionInfo.socket.emit('force_disconnect', { reason: 'inactive_timeout' });
          connectionInfo.socket.disconnect(true);
        }
      });
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Public methods for monitoring and management
  public getConnectionStats() {
    return {
      totalConnections: this.connections.size,
      userConnections: this.userSockets.size,
      connectionsPerUser: Array.from(this.userSockets.entries()).map(([userId, sockets]) => ({
        userId,
        count: sockets.size
      }))
    };
  }

  public disconnectUser(userId: string, reason = 'admin_disconnect') {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        const connectionInfo = this.connections.get(socketId);
        if (connectionInfo) {
          connectionInfo.socket.emit('force_disconnect', { reason });
          connectionInfo.socket.disconnect(true);
        }
      });
    }
  }

  // Graceful shutdown
  public shutdown() {
    console.log('🔄 Shutting down SocketServer...');
    this.connections.forEach((connectionInfo) => {
      connectionInfo.socket.disconnect(true);
    });
    this.connections.clear();
    this.userSockets.clear();
    this.io.close();
  }
}
