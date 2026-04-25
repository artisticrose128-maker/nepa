declare module 'socket.io' {
  export class Server {
    constructor(server: any, options?: any);
    on(event: string, callback: (socket: any) => void): void;
    emit(event: string, ...args: any[]): void;
  }
}
