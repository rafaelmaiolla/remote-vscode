import {EventEmitter} from 'events';
import * as vscode from 'vscode';
import * as net from 'net';
import Logger from './utils/Logger';
import Command from './Command';
import RemoteFile from './RemoteFile';

const L = Logger.getLogger('Session');

class Session extends EventEmitter {
  command : Command;
  socket : net.Socket;
  online : boolean;
  remoteFile : RemoteFile;
  subscriptions : Array<vscode.Disposable> = [];

  constructor(socket : net.Socket) {
    super();
    L.trace('constructor');

    this.socket = socket;
    this.online = true;

    this.socket.on('data', this.onSocketData.bind(this));
    this.socket.on('close', this.onSocketClose.bind(this));
  }

  onSocketData(chunk : Buffer) {
    L.trace('onSocketData', chunk);

    if (chunk) {
      this.parseChunk(chunk);
    }
  }

  onSocketClose() {
    L.trace('onSocketClose');
    this.online = false;
  }

  parseChunk(data : Buffer) {
    L.trace('parseChunk', data);

    var chunk = data.toString("utf8");
    var lines = chunk.split("\n");

    if (!this.command) {
      this.command = new Command(lines.shift());
    }

    if (this.command.isEmpty()) {
      while (lines.length) {
        var line = lines.shift();

        if (!line.trim()) {
          break;
        }

        var s = line.split(':');
        var name = s.shift().trim();
        var value = s.join(":").trim();

        if (name == 'data') {
          this.command.setDateSize(parseInt(value, 10));
          this.command.appendData(lines.join("\n"));
          break;

        } else {
          this.command.addVariable(name, value);
        }
      }

    } else {
      this.command.appendData(lines.join("\n"));
    }

    if (this.command.isReady()) {
      this.handleCommand(this.command);
      this.command = null;
    }
  }

  handleCommand(command : Command) {
    L.trace('handleCommand', command.getName());

    switch (command.getName()) {
      case 'open':
        this.handleOpen(command);
        break;

      case 'list':
        this.handleList(command);
        this.emit('list');
        break;

      case 'connect':
        this.handleConnect(command);
        this.emit('connect');
        break;
    }
  }

  openInEditor() {
    L.trace('openInEditor');

    vscode.workspace.openTextDocument(this.remoteFile.getLocalFilePath()).then((textDocument : vscode.TextDocument) => {
      vscode.window.showTextDocument(textDocument).then((textEditor : vscode.TextEditor) => {
        this.handleChanges(textDocument);
        L.info(`Opening ${this.remoteFile.getRemoteBaseName()} from ${this.remoteFile.getHost()}`);
        vscode.window.setStatusBarMessage(`Opening ${this.remoteFile.getRemoteBaseName()} from ${this.remoteFile.getHost()}`, 2000);
      });
    });
  }

  handleChanges(textDocument : vscode.TextDocument) {
    L.trace('handleChanges', textDocument.fileName);

    this.subscriptions.push(vscode.workspace.onDidSaveTextDocument((savedTextDocument : vscode.TextDocument) => {
      if (savedTextDocument == textDocument) {
        this.save();
      }
    }));

    this.subscriptions.push(vscode.workspace.onDidCloseTextDocument((closedTextDocument : vscode.TextDocument) => {
      if (closedTextDocument == textDocument) {
        this.close();
      }
    }));
  }

  async handleOpen(command : Command) {
    L.trace('handleOpen', command.getName());

    this.remoteFile = new RemoteFile(command.getVariable('token'), command.getVariable('display-name'));
    this.remoteFile.createLocalFile();
    await this.remoteFile.write(command.getData());
    this.openInEditor();
  }

  handleConnect(command : Command) {
    L.trace('handleConnect', command.getName());
  }

  handleList(command : Command) {
    L.trace('handleList', command.getName());

    // this.token = command.getVariable("token");
    // this.displayname = command.getVariable("display-name");
    // // this.remoteAddress = this.displayname.split(":")[0]
    // this.basename = "Remote files";
    // this.makeTemporaryFile();
    // fs.write(this.fd, command.getData(), null, 'utf8', () => {
    //   fs.closeSync(this.fd);
    //   // TODO: Close the file if the socket is closed
    //   this.openInEditor();
    // });
  }

  send(cmd : string) {
    L.trace('send', cmd);

    if (this.isOnline()) {
      this.socket.write(cmd + "\n");
    }
  }

  open(filePath : string) {
    L.trace('filePath', filePath);

    this.send("open");
    this.send(`path: ${filePath}`);
    this.send("");
  }

  list(dirPath : string) {
    L.trace('list', dirPath);

    this.send("list");
    this.send(`path: ${dirPath}`);
    this.send("");
  }

  save() {
    L.trace('save');

    if (!this.isOnline()) {
      L.error("NOT online");
      vscode.window.showErrorMessage(`Error saving ${this.remoteFile.getRemoteBaseName()} to ${this.remoteFile.getHost()}`);
      return;
    }

    vscode.window.setStatusBarMessage(`Saving ${this.remoteFile.getRemoteBaseName()} to ${this.remoteFile.getHost()}`, 2000);

    var data = this.remoteFile.readFileSync();

    this.send("save");
    this.send(`token: ${this.remoteFile.getToken()}`);
    this.send("data: " + Buffer.byteLength(data));
    this.socket.write(data);
    this.send("");
  }

  close() {
    L.trace('close');

    if (this.isOnline()) {
      this.online = false;
      this.send("close");
      this.send("");
      this.socket.end();
    }

    this.subscriptions.forEach((disposable : vscode.Disposable) => disposable.dispose());
  }

  isOnline() {
    L.trace('isOnline');

    L.debug('isOnline?', this.online);
    return this.online;
  }
}

export default Session;
