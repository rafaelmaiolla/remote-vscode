import {EventEmitter} from 'events';
import * as vscode from 'vscode';
import * as net from 'net';
import Logger from '../utils/Logger';
import Command from './Command';
import RemoteFile from './RemoteFile';

const L = Logger.getLogger('Session');

class Session extends EventEmitter {
  commands : Array<Command> = [];
  socket : net.Socket;
  online : boolean;
  subscriptions : Array<vscode.Disposable> = [];
  remoteFiles : Array<RemoteFile> = [];
  currFileIdx : number = 0;
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
    let remoteFileIdx = this.currFileIdx;

    if (this.commands[remoteFileIdx] && this.remoteFiles[remoteFileIdx].isReady()) {
      return;
    }

    var chunk = buffer.toString("utf8");
    var lines = chunk.split("\n");

    if (!this.commands[remoteFileIdx]) {
      this.commands.push(new Command(lines.shift()));
      this.remoteFiles.push(new RemoteFile());
    }

    if (this.remoteFiles[remoteFileIdx].isEmpty()) {
      while (lines.length) {
        var line = lines.shift().trim();

        if (!line) {
          break;
        }

        var s = line.split(':');
        var name = s.shift().trim();
        var value = s.join(":").trim();

        if (name == 'data') {
          this.remoteFiles[remoteFileIdx].setDataSize(parseInt(value, 10));
          this.remoteFiles[remoteFileIdx].setToken(this.commands[remoteFileIdx].getVariable('token'));
          this.remoteFiles[remoteFileIdx].setDisplayName(this.commands[remoteFileIdx].getVariable('display-name'));
          this.remoteFiles[remoteFileIdx].initialize();

          this.remoteFiles[remoteFileIdx].appendData(buffer.slice(buffer.indexOf(line) + Buffer.byteLength(`${line}\n`)));
          break;

        } else {
          this.commands[remoteFileIdx].addVariable(name, value);
        }
      }

    } else {
      this.remoteFiles[remoteFileIdx].appendData(buffer);
    }

    if (this.remoteFiles[remoteFileIdx].isReady()) {
      this.remoteFiles[remoteFileIdx].closeSync();
      this.handleCommand(this.commands[this.currFileIdx], remoteFileIdx);
      this.currFileIdx++;
    }
  }

  handleCommand(command : Command, remoteFileIdx : number) {
    L.trace('handleCommand', command.getName(), remoteFileIdx);

    switch (command.getName()) {
      case 'open':
        this.handleOpen(remoteFileIdx);
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

  openInEditor(remoteFileIdx : number) {
    L.trace('openInEditor', remoteFileIdx);
    let remoteFile = this.remoteFiles[remoteFileIdx];

    vscode.workspace.openTextDocument(remoteFile.getLocalFilePath()).then((textDocument : vscode.TextDocument) => {
      if (!textDocument && this.attempts < 3) {
        L.warn("Failed to open the text document, will try again");

        setTimeout(() => {
          this.attempts++;
          this.openInEditor(remoteFileIdx);
        }, 100);
        return;

      } else if (!textDocument) {
        L.error("Could NOT open the file", remoteFile.getLocalFilePath());
        vscode.window.showErrorMessage(`Failed to open file ${remoteFile.getRemoteBaseName()}`);
        return;
      }

      vscode.window.showTextDocument(textDocument, {preview: false}).then((textEditor : vscode.TextEditor) => {
        this.handleChanges(textDocument, remoteFileIdx);
        L.info(`Opening ${remoteFile.getRemoteBaseName()} from ${remoteFile.getHost()}`);
        vscode.window.setStatusBarMessage(`Opening ${remoteFile.getRemoteBaseName()} from ${remoteFile.getHost()}`, 2000);

        this.showSelectedLine(textEditor, remoteFileIdx);
      });
    });
  }

  handleChanges(textDocument : vscode.TextDocument, remoteFileIdx : number) {
    L.trace('handleChanges', textDocument.fileName);

    this.subscriptions.push(vscode.workspace.onDidSaveTextDocument((savedTextDocument : vscode.TextDocument) => {
      if (savedTextDocument == textDocument) {
        this.save(remoteFileIdx);
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

  showSelectedLine(textEditor : vscode.TextEditor, remoteFileIdx : number) {
    var selection = +(this.commands[remoteFileIdx].getVariable('selection'));
    if (selection) {
      textEditor.revealRange(new vscode.Range(selection, 0, selection + 1, 1));
    }
  }

  handleOpen(remoteFileIdx : number) {
    L.trace('handleOpen', remoteFileIdx);
    this.openInEditor(remoteFileIdx);
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

  save(remoteFileIdx : number) {
    L.trace('save');
    let remoteFile = this.remoteFiles[remoteFileIdx];

    if (!this.isOnline()) {
      L.error("NOT online");
      vscode.window.showErrorMessage(`Error saving ${remoteFile.getRemoteBaseName()} to ${remoteFile.getHost()}`);
      return;
    }

    vscode.window.setStatusBarMessage(`Saving ${remoteFile.getRemoteBaseName()} to ${remoteFile.getHost()}`, 2000);

    var buffer = remoteFile.readFileSync();

    this.send("save");
    this.send(`token: ${remoteFile.getToken()}`);
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
