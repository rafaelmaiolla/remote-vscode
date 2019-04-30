import {EventEmitter} from 'events';
import * as vscode from 'vscode';
import * as net from 'net';
import Logger from '../utils/Logger';
import Command from './Command';
import RemoteFile from './RemoteFile';

const L = Logger.getLogger('Session');

class Session extends EventEmitter {
  command : Command;
  socket : net.Socket;
  online : boolean;
  subscriptions : Array<vscode.Disposable> = [];
  remoteFile : RemoteFile;
  attempts : number = 0;
  closeTimeout : NodeJS.Timer;

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

  parseChunk(buffer : any) {
    L.trace('parseChunk', buffer);

    if (this.command && this.remoteFile.isReady()) {
      return;
    }

    var chunk = buffer.toString("utf8");
    var lines = chunk.split("\n");

    if (!this.command) {
      this.command = new Command(lines.shift());
      this.remoteFile = new RemoteFile();
    }

    if (this.remoteFile.isEmpty()) {
      while (lines.length) {
        var line = lines.shift().trim();

        if (!line) {
          break;
        }

        var s = line.split(':');
        var name = s.shift().trim();
        var value = s.join(":").trim();

        if (name == 'data') {
          this.remoteFile.setDataSize(parseInt(value, 10));
          this.remoteFile.setToken(this.command.getVariable('token'));
          this.remoteFile.setDisplayName(this.command.getVariable('display-name'));
          this.remoteFile.initialize();

          this.remoteFile.appendData(buffer.slice(buffer.indexOf(line) + Buffer.byteLength(`${line}\n`)));
          break;

        } else {
          this.command.addVariable(name, value);
        }
      }

    } else {
      this.remoteFile.appendData(buffer);
    }

    if (this.remoteFile.isReady()) {
      this.remoteFile.closeSync();
      this.handleCommand(this.command);
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
      if (!textDocument && this.attempts < 3) {
        L.warn("Failed to open the text document, will try again");

        setTimeout(() => {
          this.attempts++;
          this.openInEditor();
        }, 100);
        return;

      } else if (!textDocument) {
        L.error("Could NOT open the file", this.remoteFile.getLocalFilePath());
        vscode.window.showErrorMessage(`Failed to open file ${this.remoteFile.getRemoteBaseName()}`);
        return;
      }

      vscode.window.showTextDocument(textDocument).then((textEditor : vscode.TextEditor) => {
        this.handleChanges(textDocument);
        L.info(`Opening ${this.remoteFile.getRemoteBaseName()} from ${this.remoteFile.getHost()}`);
        vscode.window.setStatusBarMessage(`Opening ${this.remoteFile.getRemoteBaseName()} from ${this.remoteFile.getHost()}`, 2000);

        this.showSelectedLine(textEditor);
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
        this.closeTimeout  && clearTimeout(this.closeTimeout);
        // If you change the textDocument language, it will close and re-open the same textDocument, so we add
        // a timeout to make sure it is really being closed before close the socket.
        this.closeTimeout = setTimeout(() => {
          this.close();
        }, 2);
      }
    }));

    this.subscriptions.push(vscode.workspace.onDidOpenTextDocument((openedTextDocument : vscode.TextDocument) => {
      if (openedTextDocument == textDocument) {
        this.closeTimeout  && clearTimeout(this.closeTimeout);
      }
    }));
  }

  showSelectedLine(textEditor : vscode.TextEditor) {
    var selection = +(this.command.getVariable('selection'));
    if (selection) {
      var line = ((selection-1) > 0) ? (selection-1) : 0;
      textEditor.revealRange(new vscode.Range(line, 0, line, 0), vscode.TextEditorRevealType.InCenter);
      textEditor.selection = new vscode.Selection(new vscode.Position(line,0), new vscode.Position(line,0));
    }
  }

  handleOpen(command : Command) {
    L.trace('handleOpen', command.getName());
    this.openInEditor();
  }

  handleConnect(command : Command) {
    L.trace('handleConnect', command.getName());
  }

  handleList(command : Command) {
    L.trace('handleList', command.getName());
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

    var buffer = this.remoteFile.readFileSync();

    this.send("save");
    this.send(`token: ${this.remoteFile.getToken()}`);
    this.send("data: " + buffer.length);
    this.socket.write(buffer);
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
