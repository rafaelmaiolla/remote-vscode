'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Server from './Server';

var server;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "remote-visual-studio-code" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let startSeverDispose = vscode.commands.registerCommand('extension.startServer', () => {
		// The code you place here will be executed every time your command is executed

    if (!server) {
      server = new Server();
    }

    server.start();

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(startSeverDispose);

  let stopSeverDispose = vscode.commands.registerCommand('extension.stopServer', () => {
    if (server) {
      server.stop();
    }
	});

	context.subscriptions.push(stopSeverDispose);
}

// this method is called when your extension is deactivated
export function deactivate() {
  if (server) {
    server.stop();
  }
}