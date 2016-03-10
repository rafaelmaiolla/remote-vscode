'use strict';
import * as vscode from 'vscode';
import Server from './lib/Server';

var server;

const startServer = () => {
  if (!server) {
    server = new Server();
  }

  server.start();
};

const stopServer = () => {
  if (server) {
    server.stop();
  }
};

export function activate(context: vscode.ExtensionContext) {

  var remoteConfig = vscode.workspace.getConfiguration("remote");
  var onstartup = remoteConfig.get("onstartup");

  if (onstartup) {
    startServer();
  }

	context.subscriptions.push(vscode.commands.registerCommand('extension.startServer', startServer));
  context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', stopServer));
}

export function deactivate() {
  if (server) {
    server.stop();
  }
}