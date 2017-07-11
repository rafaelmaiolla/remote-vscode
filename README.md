# Remote VSCode

[![Build Status](https://travis-ci.org/rafaelmaiolla/remote-vscode.svg?branch=master)](https://travis-ci.org/rafaelmaiolla/remote-vscode)
[![Known Vulnerabilities](https://snyk.io/test/github/rafaelmaiolla/remote-vscode/badge.svg)](https://snyk.io/test/github/rafaelmaiolla/remote-vscode)
[![Dependency Status](https://david-dm.org/rafaelmaiolla/remote-vscode.svg)](https://david-dm.org/rafaelmaiolla/remote-vscode)
[![devDependency Status](https://david-dm.org/rafaelmaiolla/remote-vscode/dev-status.svg)](https://david-dm.org/rafaelmaiolla/remote-vscode#info=devDependencies)

A package that implements the Textmate's 'rmate' feature for VSCode.

## Installation

* Install the package from the editor's extension manager.
* Install a rmate version
 - Ruby version: https://github.com/textmate/rmate
 - Bash version: https://github.com/aurora/rmate
 - Perl version: https://github.com/davidolrik/rmate-perl
 - Python version: https://github.com/sclukey/rmate-python
 - Nim version: https://github.com/aurora/rmate-nim
 - C version: https://github.com/hanklords/rmate.c
 - Node.js version: https://github.com/jrnewell/jmate
 - Golang version: https://github.com/mattn/gomate

## Usage

* Configure in the User Settings:
  ```javascript
  //-------- Remote VSCode configuration --------

  // Port number to use for connection.
  "remote.port": 52698,

  // Launch the server on start up.
  "remote.onstartup": true
  ```

* Start the server in the command palette - Press F1 and type `Remote: Start server`, and press `ENTER` to start the server.
  You may see a `Starting server` at the status bar in the botton.

* Create an ssh tunnel
  ```bash
  ssh -R 52698:127.0.0.1:52698 user@example.org
  ```

* Go to the remote system and run
  ```bash
  rmate -p 52698 file
  ```

## License
[MIT](LICENSE.txt)
