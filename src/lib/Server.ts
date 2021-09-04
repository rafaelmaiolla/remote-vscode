import * as net from 'net';
import Session from "./Session";
import * as vscode from 'vscode';
import Logger from '../utils/Logger';
import {EventEmitter} from 'events';

const L = Logger.getLogger('Server');

export const DEFAULT_PORT = 52698;
export const DEFAULT_HOST = '127.0.0.1';

class Server extends EventEmitter {
  online : boolean = false;
  server : net.Server | undefined;
  port : number = DEFAULT_PORT;
  host : string = DEFAULT_HOST;
  dontShowPortAlreadyInUseError : boolean = false;
  defaultSession : Session | undefined;

  constructor() {
    super();
    L.trace('constructor');
  }

  start(quiet : boolean) {
    L.trace('start', quiet);

    if (this.isOnline()) {
      this.stop();
      L.info("Restarting server");
      vscode.window.setStatusBarMessage("Restarting server", 2000);
      this.emit('restarting');

    } else {
      if (!quiet) {
        L.info("Starting server");
        vscode.window.setStatusBarMessage("Starting server", 2000);
      }

      this.emit('starting');
    }

    this.server = net.createServer(this.onServerConnection.bind(this));

    this.server.on('listening', this.onServerListening.bind(this));
    this.server.on('error', this.onServerError.bind(this));
    this.server.on("close", this.onServerClose.bind(this));

    this.server.listen(this.getPort(), this.getHost());
  }

  setPort(port : number) {
    L.trace('setPort', port);
    this.port = port;
  }

  getPort() : number {
    L.trace('getPort', +(this.port || DEFAULT_PORT));
    return +(this.port || DEFAULT_PORT);
  }

  setHost(host : string) {
    L.trace('setHost', host);
    this.host = host;
  }

  getHost() : string {
    L.trace('getHost', (this.host || DEFAULT_HOST));
    return (this.host || DEFAULT_HOST);
  }

  setDontShowPortAlreadyInUseError(dontShowPortAlreadyInUseError : boolean) {
    L.trace('setDontShowPortAlreadyInUseError', dontShowPortAlreadyInUseError);
    this.dontShowPortAlreadyInUseError = dontShowPortAlreadyInUseError;
  }

  onServerConnection(socket: net.Socket) {
    L.trace('onServerConnection');

    var session = new Session(socket);
    session.send("VSCode " + 1);

    session.on('connect', () => {
      console.log("connect");
      this.defaultSession = session;
    });
  }

  onServerListening() {
    L.trace('onServerListening');
    this.setOnline(true);
    this.emit('ready');
  }

  onServerError(e: any) {
    L.trace('onServerError', e);

    this.emit('error', e);

    if (e.code == 'EADDRINUSE') {
      if (this.dontShowPortAlreadyInUseError) {
        return;
      } else {
        return vscode.window.showErrorMessage(`Failed to start server, port ${e.port} already in use`);
      }
    }

    vscode.window.showErrorMessage(`Failed to start server, will try again in 10 seconds`);

    setTimeout(() => {
      this.start(true);
    }, 10000);

    return;
  }

  onServerClose() {
    L.trace('onServerClose');
  }

  stop() {
    L.trace('stop');

    this.emit('stopped');

    if (this.isOnline()) {
      vscode.window.setStatusBarMessage("Stopping server", 2000);
      this.server?.close();
      this.setOnline(false);
    }
  }

  setOnline(online : boolean) {
    L.trace('setOnline', online);
    this.online = online;
  }

  isOnline() : boolean {
    L.trace('isOnline');

    L.debug('isOnline?', this.online);
    return this.online;
  }
}

export default Server;
