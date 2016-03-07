'use strict';
import * as vscode from 'vscode';
import Server from './lib/Server';

var server;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('extension.startServer', () => {

    if (!server) {
      server = new Server();
    }

    server.start();
	}));

  context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', () => {
    if (server) {
      server.stop();
    }
	}));
}

export function deactivate() {
  if (server) {
    server.stop();
  }
}