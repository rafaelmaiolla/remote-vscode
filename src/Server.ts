import * as net from 'net';
import Session from "./session";

class Server {
  online : boolean;
  server;
  session;

  start(quiet : boolean = false) {
    if (this.online) {
      this.stop();
      // TODO: Show restaring message
      console.log("Restarting server");

    } else {
      if (!quiet) {
        // TODO: Show starting message
        console.log("Starting server");
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

    var port = '52688';

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
      this.server.close();
      this.online = false;
    }
  }
}

export default Server;
