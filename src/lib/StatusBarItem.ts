import * as vscode from 'vscode';
import Server from './Server';
import Logger from '../utils/Logger';

const L = Logger.getLogger('StatusBarItem');

class StatusBarItem {
  server: Server = null;
  item: vscode.StatusBarItem;

  constructor() {
    L.trace('constructor');

    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
    this.item.color = new vscode.ThemeColor('statusBar.foreground');
    this.item.text = '$(rss)';
  }

  setServer(server: Server) {
    L.trace('setServer');

    if (this.server) {
      L.debug('setServer', 'remove all listeners');
      this.server.removeAllListeners();
    }

    this.server = server;

    this.handleEvents(server);
  }

  handleEvents(server: Server) {
    L.trace('handleEvents');

    server.on('restarting', this.onRestarting.bind(this));
    server.on('starting', this.onStarting.bind(this));
    server.on('ready', this.onReady.bind(this));
    server.on('error', this.onError.bind(this));
    server.on('stopped', this.onStopped.bind(this))
  }

  onRestarting() {
    L.trace('onRestarting');

    this.item.tooltip = 'Remote: Restarting server...';
    this.item.color = new vscode.ThemeColor('statusBar.foreground');
    this.item.show();
  }

  onStarting() {
    L.trace('onStarting');

    this.item.tooltip = 'Remote: Starting server...';
    this.item.color = new vscode.ThemeColor('statusBar.foreground');
    this.item.show();
  }

  onReady() {
    L.trace('onReady');

    this.item.tooltip = 'Remote: Server ready.';
    this.item.color = new vscode.ThemeColor('statusBar.foreground');
    this.item.show();
  }

  onError(e) {
    L.trace('onError');

    if (e.code == 'EADDRINUSE') {
      L.debug('onError', 'EADDRINUSE');
      this.item.tooltip = 'Remote error: Port already in use.';

    } else {
      this.item.tooltip = 'Remote error: Failed to start server.';
    }

    this.item.color = new vscode.ThemeColor('errorForeground');
    this.item.show();
  }

  onStopped() {
    L.trace('onStopped');

    this.item.tooltip = 'Remote: Server stopped.';
    this.item.color = new vscode.ThemeColor('statusBar.foreground');
    this.item.hide();
  }
}

export default StatusBarItem;
