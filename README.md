# Remote VSCode

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

## Usage

* Configure in the User Settings:
  ```javascript
  //-------- Remote VSCode configuration --------

  // Port number to use for connection.
  "remote.port": 52689,

  // Launch the server on start up.
  "remote.onstartup": true
  ```

* Start the server in the command palette - Press F1 and type `Remote: Start server`, and press `ENTER` to start the server.
  You may see a `Starting server` at the status bar in the botton.

* Create an ssh tunnel
  ```bash
  ssh -R 52689:127.0.0.1:52689 user@example.org
  ```

* Go to the remove system and run
  ```bash
  rmate -p 52689 file
  ```

## License
[MIT](LICENSE)
