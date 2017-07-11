import * as net from 'net';
import Session from "./Session";
import * as vscode from 'vscode';
import Logger from '../utils/Logger';

const L = Logger.getLogger('Server');

const DEFAULT_PORT = 52698;
const DEFAULT_HOST = '127.0.0.1';

class Server {
  online : boolean = false;
  server : net.Server;
  port : number;
  host : string;
  squashListenError : boolean = false;
  defaultSession : Session;

  start(quiet : boolean) {
    L.trace('start', quiet);

    if (this.isOnline()) {
      this.stop();
      L.info("Restarting server");
      vscode.window.setStatusBarMessage("Restarting server", 2000);

    } else {
      if (!quiet) {
        L.info("Starting server");
        vscode.window.setStatusBarMessage("Starting server", 2000);
      }
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
    L.trace('getHost', +(this.host || DEFAULT_HOST));
    return (this.host || DEFAULT_HOST);
  }

  setSquashListenError(squash : boolean) {
    L.trace('setSquashListenError', squash);
    this.squashListenError = squash;
  }

  onServerConnection(socket) {
    L.trace('onServerConnection');

    var session = new Session(socket);
    session.send("VSCode " + 1);

    session.on('connect', () => {
      console.log("connect");
      this.defaultSession = session;
    });
  }

  onServerListening(e) {
    L.trace('onServerListening');
    this.setOnline(true);
  }

  onServerError(e) {
    L.trace('onServerError', e);

    if (e.code == 'EADDRINUSE') {
      if (this.squashListenError) {
        return
      } else {
        return vscode.window.showErrorMessage(`Failed to start server, port ${e.port} already in use`);
      }
    }

    vscode.window.showErrorMessage(`Failed to start server, will try again in 10 seconds}`);

    setTimeout(() => {
      this.start(true);
    }, 10000);
  }

  onServerClose() {
    L.trace('onServerClose');
  }

  stop() {
    L.trace('stop');

    if (this.isOnline()) {
      vscode.window.setStatusBarMessage("Stoping server", 2000);
      this.server.close();
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
