import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import randomString  from '../utils/randomString';
import Logger from '../utils/Logger';

const L = Logger.getLogger('RemoteFile');

class RemoteFile {
  token : string;
  localFilePath : string;

  remoteHost : string;
  remoteBaseName : string;

  constructor(token : string, displayName : string) {
    L.trace('constructor', token, displayName);

    this.token = token;
    this.remoteHost = displayName.split(':')[0];
    this.remoteBaseName = path.basename(displayName.split(':')[1]);
  }

  getToken() {
    L.trace('getRemoteBaseName');
    return this.token;
  }

  getRemoteBaseName() {
    L.trace('getRemoteBaseName');
    return this.remoteBaseName;
  }

  getLocalDirectoryName() {
    L.trace('getLocalDirectoryName');
    return path.dirname(this.localFilePath);
  }

  getHost() {
    L.trace('getHost');
    return this.remoteHost;
  }

  getLocalFilePath() {
    L.trace('getLocalFilePath');
    return this.localFilePath;
  }

  createLocalFile() {
    L.trace('createLocalFile');

    this.localFilePath = path.join(os.tmpdir(), randomString(10), this.getRemoteBaseName());

    this.createLocalDir();


  }

  createLocalDir() {
    L.trace('createLocalFile');
    fse.mkdirsSync(this.getLocalDirectoryName());
  }

  async write(data : string) {
    L.trace('write');

    return new Promise((resolve, reject) => {
      var fd = fs.openSync(this.localFilePath, 'w');
      fs.write(fd, data, 0, 'utf8', () => {
        fs.closeSync(fd);
        resolve();
      });
    });
  }

  readFileSync() : string {
    L.trace('readFileSync');
    return fs.readFileSync(this.localFilePath, 'utf8');
  }
}

export default RemoteFile;