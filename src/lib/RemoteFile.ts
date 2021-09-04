import * as fs from 'fs';
import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import randomString  from '../utils/randomString';
import Logger from '../utils/Logger';

const L = Logger.getLogger('RemoteFile');

class RemoteFile {
  dataSize: number = -1;
  writtenDataSize: number = 0;

  token: string = "";
  localFilePath: string = "";

  remoteHost: string | undefined;
  remoteBaseName: string = "";

  fileDescriptor: number | null = null;

  constructor() {
    L.trace('constructor');
  }

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    L.trace("getRemoteBaseName");
    return this.token;
  }

  setDisplayName(displayName: string) {
    var displayNameSplit = displayName.split(":");

    if (displayNameSplit.length === 1) {
      this.remoteHost = "";

    } else {
      this.remoteHost = displayNameSplit.shift();
    }

    this.remoteBaseName = displayNameSplit.join(":");
  }

  getHost() {
    L.trace("getHost", this.remoteHost);
    return this.remoteHost;
  }

  getRemoteBaseName() {
    L.trace("getRemoteBaseName");
    return this.remoteBaseName;
  }

  createLocalFilePath() {
    L.trace("createLocalFilePath");
    this.localFilePath = path.join(
      os.tmpdir(),
      randomString(10),
      this.getRemoteBaseName()
    );
  }

  getLocalDirectoryName() {
    L.trace("getLocalDirectoryName", path.dirname(this.localFilePath || ""));
    if (!this.localFilePath) {
      return;
    }
    return path.dirname(this.localFilePath);
  }

  createLocalDir() {
    L.trace("createLocalDir");

    const localDirectoryName = this.getLocalDirectoryName();
    if (localDirectoryName == null) {
      L.error("createLocalDir - local directory name is not defined");
      return;
    }

    fse.mkdirsSync(localDirectoryName);
  }

  getLocalFilePath() {
    L.trace("getLocalFilePath", this.localFilePath);
    return this.localFilePath;
  }

  openSync() {
    L.trace("openSync");
    this.fileDescriptor = fs.openSync(this.getLocalFilePath(), "w");
    L.debug("openSync - file descriptor " + this.fileDescriptor);
  }

  closeSync() {
    L.trace("closeSync");
    if (this.fileDescriptor == null) {
      L.error("closeSync - file descriptor is not defined");
      return;
    }

    fs.closeSync(this.fileDescriptor);
    this.fileDescriptor = null;
  }

  initialize() {
    L.trace("initialize");
    this.createLocalFilePath();
    this.createLocalDir();
    this.openSync();
  }

  finalize() {
    L.trace("finalize");
    this.closeSync();
  }

  writeSync(buffer: any, offset: number, length: number) {
    L.trace("writeSync");
    if (this.fileDescriptor) {
      L.debug("writing data");
      fs.writeSync(this.fileDescriptor, buffer, offset, length, undefined);
    }
  }

  readFileSync(): Buffer {
    L.trace("readFileSync");
    return fs.readFileSync(this.localFilePath);
  }

  appendData(buffer: Buffer) {
    L.trace("appendData", buffer.length);

    var length = buffer.length;
    if (this.writtenDataSize + length > this.dataSize) {
      length = this.dataSize - this.writtenDataSize;
    }

    this.writtenDataSize += length;
    L.debug("writtenDataSize", this.writtenDataSize);

    this.writeSync(buffer, 0, length);
  }

  setDataSize(dataSize: number) {
    L.trace("setDataSize", dataSize);
    this.dataSize = dataSize;
  }

  getDataSize(): number {
    L.trace("getDataSize");
    L.debug("getDataSize", this.dataSize);
    return this.dataSize;
  }

  isInitialized(): boolean {
    L.trace("isInitialized");
    L.debug("isInitialized?", this.dataSize !== -1);
    return this.dataSize !== -1;
  }

  isReady(): boolean {
    L.trace("isReady");
    L.debug("isReady?", this.writtenDataSize == this.dataSize);
    return this.writtenDataSize == this.dataSize;
  }
}

export default RemoteFile;
