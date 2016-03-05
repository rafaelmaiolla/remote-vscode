import {EventEmitter} from 'events';
import randomString  from './randomString';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';

class Session extends EventEmitter {
  settings;
  variables : Object = {};
  cmd : string;
  data : string;
  socket;
  online : boolean;
  tempFile : string;
  basename : string;
  fd : number;
  datasize : number;
  token : string;
  displayname : string;
  remoteAddress : string;

  constructor(socket) {
    super();
    this.socket = socket;
    this.online = true;

    this.socket.on('data', (chunk) => {
      if (chunk) {
        this.parseChunk(chunk);
      }
    });

    this.socket.on('close', () => {
      this.online = false;
    });
  }

  makeTemporaryFile() {
    this.tempFile = path.join(os.tmpdir(), randomString(10), this.basename);
    var dirname = path.dirname(this.tempFile);
    fs.mkdirsSync(dirname);
    this.fd = fs.openSync(this.tempFile, 'w');
  }

  parseChunk(chunk) {
    debugger;
    var chunk = chunk.toString("utf8");
    var lines = chunk.split("\n");

    if (!this.cmd) {
      this.cmd = lines.shift();
    }

    if (!this.datasize) {
      while (lines.length) {
        var line = lines.shift();

        if (!line.trim()) {
          break;
        }

        var s = line.split(':');
        var name = s.shift().trim();
        var value = s.join(":").trim();
        this.variables[name] = value;

        if (name == 'data') {
          this.datasize = parseInt(value, 10);
          this.data = lines.join("\n").slice(0, this.datasize);
          break;
        }
      }
    } else {
      this.data += lines.join("\n");
      this.data = this.data.slice(0, this.datasize);
    }

    if (this.data && this.data.length == this.datasize) {
      if ('data' in this.variables) {
        delete this.variables['data'];
      }

      this.handleCommand(this.cmd, this.variables, this.data);
      this.cmd = null;
      this.variables;
      this.data = null;
    }
  }

  handleCommand(cmd, variables, data : string) {
    switch(cmd) {
      case 'open':
        this.handleOpen(variables, data);
        break;
      case 'list':
        this.handleList(variables, data);
        this.emit('list');
        break;
      case 'connect':
        this.handleConnect(variables, data);
        this.emit('connect');
        break;
    }
  }

  openInEditor() {
    // TODO
    // # register events
    // atom.workspace.open(@tempfile).then (editor) =>
    //     @handleConnection(editor)
    vscode.workspace.openTextDocument(this.tempFile).then(() => {
      debugger;
    });
  }

  handleConnection() {
    // TODO
    // buffer = editor.getBuffer()
    // @subscriptions = new CompositeDisposable
    // @subscriptions.add buffer.onDidSave(@save)
    // @subscriptions.add buffer.onDidDestroy(@close)
  }

  handleOpen(variables, data : string) {
    this.token = variables["token"];
    this.displayname = variables["display-name"];
    this.remoteAddress = this.displayname.split(":")[0];
    this.basename = path.basename(this.displayname.split(":")[1]);
    this.makeTemporaryFile();
    fs.write(this.fd, data, 0, 'utf8', () => {
      fs.closeSync(this.fd);
      this.openInEditor();
    });
  }

  handleConnect(variable, data) {
    // TODO: show message
  }

  handleList(variables, data : string) {
    this.token = variables["token"];
    this.displayname = variables["display-name"];
    // this.remoteAddress = this.displayname.split(":")[0]
    this.basename = "Remote files"
    this.makeTemporaryFile();
    fs.write(this.fd, data, null, 'utf8', () => {
      fs.closeSync(this.fd);
      // TODO: Close the file if the socket is closed
      this.openInEditor();
    });
  }

  send(cmd) {
    if (this.online) {
      this.socket.write(cmd + "\n");
    }
  }

  open(filePath) {
    this.send("open");
    this.send("path: #{filePath}");
    this.send("");
  }

  list(dirPath) {
    this.send("list");
    this.send("path: #{dirPath}");
    this.send("");
  }

  save() {
    if (this.online) {
      // TODO show status
      // status-message.display "Error saving #{path.basename @tempfile} to #{@remoteAddress}", 2000
      return
    }

    // TODO show status
    // status-message.display "Saving #{path.basename @tempfile} to #{@remoteAddress}", 2000
    this.send("save");
    this.send("token: #{@token}");
    var data = fs.readFileSync(this.tempFile, 'utf8');
    this.send("data: " + Buffer.byteLength(data));
    this.socket.write(data);
    this.send("");
  }

  close() {
    if (this.online) {
      this.online = false;
      this.send("close");
      this.send("");
      this.socket.end();
    }

    // this.subscriptions.dispose()
  }
}

export default Session;
