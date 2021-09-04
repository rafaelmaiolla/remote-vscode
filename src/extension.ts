'use strict';
import * as vscode from 'vscode';
import Server, { DEFAULT_HOST, DEFAULT_PORT } from './lib/Server';
import Logger from './utils/Logger';
import StatusBarItem from './lib/StatusBarItem';

const L = Logger.getLogger('extension');

var server : Server;
var changeConfigurationDisposable : vscode.Disposable;
var port : number;
var host : string;
var onStartup : boolean;
var dontShowPortAlreadyInUseError : boolean;
var statusBarItem : StatusBarItem;

type Configuration = {
  onStartup: boolean
  dontShowPortAlreadyInUseError: boolean
  port: number,
  host: string
}

const startServer = () => {
  L.trace('startServer');

  if (!server) {
    server = new Server();
  }

  if (!statusBarItem) {
    statusBarItem = new StatusBarItem();
  }

  server.setPort(port);
  server.setHost(host);
  server.setDontShowPortAlreadyInUseError(dontShowPortAlreadyInUseError);
  server.start(false);

  statusBarItem.setServer(server);
};

const stopServer = () => {
  L.trace('stopServer');

  if (server) {
    server.stop();
  }
};

const initialize = () => {
  L.trace('initialize');

  var configuration = getConfiguration();
  onStartup = configuration.onStartup;
  port = configuration.port;
  host = configuration.host;
  dontShowPortAlreadyInUseError = configuration.dontShowPortAlreadyInUseError;

  if (onStartup) {
    startServer();
  }
};

const getConfiguration = (): Configuration => {
  L.trace('getConfiguration');
  var remoteConfig = vscode.workspace.getConfiguration('remote');

  var configuration = {
    onStartup: remoteConfig.get<boolean>('onstartup') ?? false,
    dontShowPortAlreadyInUseError: remoteConfig.get<boolean>('dontShowPortAlreadyInUseError') ?? false,
    port: remoteConfig.get<number>('port') ?? DEFAULT_PORT,
    host: remoteConfig.get<string>('host') ?? DEFAULT_HOST
  };

  L.debug("getConfiguration", configuration);

  return configuration;
};

const hasConfigurationChanged = (configuration: Configuration) => {
  L.trace('hasConfigurationChanged');
  var hasChanged = ((configuration.port !== port) ||
                    (configuration.onStartup !== onStartup) ||
                    (configuration.host !== host) ||
                    (configuration.dontShowPortAlreadyInUseError !== dontShowPortAlreadyInUseError));

  L.debug("hasConfigurationChanged?", hasChanged);
  return hasChanged;
}

const onConfigurationChange = () => {
  L.trace('onConfigurationChange');

  var configuration = getConfiguration();

  if (hasConfigurationChanged(configuration)) {
    initialize();
  }
};

export function activate(context: vscode.ExtensionContext) {
  initialize();

	context.subscriptions.push(vscode.commands.registerCommand('extension.startServer', startServer));
  context.subscriptions.push(vscode.commands.registerCommand('extension.stopServer', stopServer));

  changeConfigurationDisposable = vscode.workspace.onDidChangeConfiguration(onConfigurationChange);
}

export function deactivate() {
  stopServer();
  changeConfigurationDisposable.dispose();
}
