import * as net from 'net';
import Session from "./Session";
import * as vscode from 'vscode';

class Server {
  online : boolean;
  server;
  session;

  start(quiet : boolean = false) {
    if (this.online) {
      this.stop();
      vscode.window.setStatusBarMessage("Restarting server", 2000);

    } else {
      if (!quiet) {
        vscode.window.setStatusBarMessage("Starting server", 2000);
      }
    }

    this.server = net.createServer((socket) => {
      console.log("Create new session");

      var session = new Session(socket);
      session.send("Visual code studio " + 1);

      session.on('connect', () => {
        console.log("connect");
        this.session = session;
      });
    });

    var remoteConfig = vscode.workspace.getConfiguration("remote");
    var port = remoteConfig.get("port");

    this.server.on('listening', (e) => {
      console.log('listening');
      this.online = true;
    });

    this.server.on('error', (e) => {
      console.log('error');
      setTimeout(() => {
        console.log('starting');
        this.start(true);
      }, 10000);
    });

    this.server.on("close", () => {
      console.log('close');
    });

    this.server.listen(port, 'localhost');
  }

  stop() {
    if (this.online) {
      vscode.window.setStatusBarMessage("Stoping server", 2000);
      this.server.close();
      this.online = false;
    }
  }
}

export default Server;
