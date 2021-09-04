import * as fs from 'fs';
import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import RemoteFile from '../../lib/RemoteFile';

describe("RemoveFile", () => {
  let remoteFile: RemoteFile;

  describe("constructor()", () => {
	});

  describe("setToken()", () => {
    it('should set the token', () => {
      remoteFile = new RemoteFile();
  
      var token = "test";
      remoteFile.setToken(token);
  
      assert.strictEqual(remoteFile.getToken(), token);
    });
	});

  describe("getToken()", () => {
    it('should get the token', () => {
      remoteFile = new RemoteFile();
  
      var token = "test";
      remoteFile.setToken(token);
  
      assert.strictEqual(token, remoteFile.getToken());
    });
	});

  describe("setDisplayName()", () => {
    it('should set the host and remote base name when setting the display name as stdin', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "untitled (stdin)";
  
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
  
      assert.strictEqual(hostname, remoteFile.getHost());
      assert.strictEqual(remoteBasename, remoteFile.getRemoteBaseName());
    });

    it('should set the host and remote base name when setting the display name as file path', () => {
      remoteFile = new RemoteFile();

      var hostname = "hostname";
      var remoteBasename = "someFile";
  
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
  
      assert.strictEqual(hostname, remoteFile.getHost());
      assert.strictEqual(remoteBasename, remoteFile.getRemoteBaseName());
    });

    it('should set the host and remove base name when setting the display name as file name', () => {
      remoteFile = new RemoteFile();

      var fileName = "this is a file name";

      remoteFile.setDisplayName(`${fileName}`);

      assert.strictEqual(fileName, remoteFile.getRemoteBaseName());
    });
	});

  describe("getHost()", () => {
    it('should return the host', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "untitled (stdin)";
  
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
      assert.strictEqual(hostname, remoteFile.getHost());
    });
	});

  describe("getRemoteBaseName()", () => {
    it('should return the remove base name', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "someFile";
  
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
  
      assert.strictEqual(remoteBasename, remoteFile.getRemoteBaseName());
    });
	});

  describe("createLocalFilePath()", () => {
    it('should create the local file path', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "someFile";
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
      remoteFile.createLocalFilePath();
  
      var localFilePath = remoteFile.getLocalFilePath();
  
      assert.strictEqual(true, localFilePath.startsWith(os.tmpdir()));
      assert.strictEqual(true, localFilePath.endsWith(remoteBasename));
    });
	});

  describe("getLocalDirectoryName()", () => {
    it('should get the local directory name', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "someFile";
  
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
  
      assert.strictEqual(undefined, remoteFile.getLocalDirectoryName());
  
      remoteFile.createLocalFilePath();
  
      var directoryPath = path.dirname(remoteFile.getLocalFilePath());
      assert.strictEqual(directoryPath, remoteFile.getLocalDirectoryName());
    });
	});

  describe("createLocalDir()", () => {
    it('should create the local directory', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "someFile";
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
      remoteFile.createLocalFilePath();
      var directoryPath = remoteFile.getLocalDirectoryName();
      remoteFile.createLocalDir();
  
      assert.strictEqual(true, fs.statSync(directoryPath!).isDirectory());
    });
	});

  describe("getLocalFilePath()", () => {
    it('should get the local file path', () => {
      remoteFile = new RemoteFile();
  
      var hostname = "hostname";
      var remoteBasename = "someFile";
      remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
  
      assert.strictEqual(remoteFile.getLocalFilePath(), '');
  
      remoteFile.createLocalFilePath();
  
      var localFilePath = remoteFile.getLocalFilePath();
  
      assert.strictEqual(localFilePath.startsWith(os.tmpdir()), true);
      assert.strictEqual(localFilePath.endsWith(remoteBasename), true);
    });
	});

  describe("openSync()", () => {
	});

  describe("closeSync()", () => {
	});

  describe("writeSync()", () => {
	});

  describe("readFileSync()", () => {
	});

  describe("appendData()", () => {
	});

  describe("setDataSize()", () => {
    it('should set the data size', () => {
      remoteFile = new RemoteFile();

      remoteFile.setDataSize(1000);
      assert.strictEqual(remoteFile.getDataSize(), 1000);
    });
	});

  describe("getDataSize()", () => {
    it('should return the data size', () => {
      remoteFile = new RemoteFile();

      remoteFile.setDataSize(1000);
      assert.strictEqual(remoteFile.getDataSize(), 1000);
    });
  });

  describe("isInitialized()", () => {
    it('should initialize as false', () => {
      remoteFile = new RemoteFile();

      assert.strictEqual(remoteFile.isInitialized(), false);
    });

    it('should be set as initialized after setting the data size', () => {
      remoteFile = new RemoteFile();

      remoteFile.setDataSize(1000);
      assert.strictEqual(remoteFile.isInitialized(), true);
    });
	});

  describe("isReady()", () => {
    it('should initialize as not ready', () => {
      remoteFile = new RemoteFile();

      assert.strictEqual(remoteFile.isReady(), false);
    });

    it('should return false if the file is not ready', () => {
      remoteFile = new RemoteFile();

      remoteFile.setDataSize(1000);
      assert.strictEqual(remoteFile.isReady(), false);
    });

    it('should return true if the file is ready', () => {
      remoteFile = new RemoteFile();

      const buffer = Buffer.from('Test data');

      remoteFile.setDataSize(buffer.length);
      remoteFile.appendData(buffer);
      assert.strictEqual(remoteFile.isReady(), true);
    });
	});
});
