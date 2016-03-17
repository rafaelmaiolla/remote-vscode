import * as fs from 'fs';
import * as assert from 'assert';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import RemoteFile from '../src/lib/RemoteFile';

suite("Command Tests", () => {
  test("constructor", () => {
    var remoteFile = new RemoteFile();
	});

  test("setToken", () => {
    var token = "test";
    var remoteFile = new RemoteFile();

    remoteFile.setToken(token);

    assert.equal(token, remoteFile.getToken());
	});

  test("getToken", () => {
    var token = "test";
    var remoteFile = new RemoteFile();

    remoteFile.setToken(token);

    assert.equal(token, remoteFile.getToken());
	});

  test("setDisplayName - stdin", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "untitled (stdin)";

    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);

    assert.equal(hostname, remoteFile.getHost());
    assert.equal(remoteBasename, remoteFile.getRemoteBaseName());
	});

  test("setDisplayName - file path", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";

    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);

    assert.equal(hostname, remoteFile.getHost());
    assert.equal(remoteBasename, remoteFile.getRemoteBaseName());
  });

  test("setDisplayName - file name", () => {
    var remoteFile = new RemoteFile();

    var fileName = "this is a file name";

    remoteFile.setDisplayName(`${fileName}`);

    assert.equal(fileName, remoteFile.getRemoteBaseName());
  });

  test("getHost", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "untitled (stdin)";

    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
    assert.equal(hostname, remoteFile.getHost());
	});

  test("getRemoteBaseName", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";

    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);

    assert.equal(remoteBasename, remoteFile.getRemoteBaseName());
	});

  test("createLocalFilePath", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";
    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
    remoteFile.createLocalFilePath();

    var localFilePath = remoteFile.getLocalFilePath();

    assert.equal(true, localFilePath.startsWith(os.tmpdir()));
    assert.equal(true, localFilePath.endsWith(remoteBasename));
	});

  test("getLocalDirectoryName", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";

    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);

    assert.equal(undefined, remoteFile.getLocalDirectoryName());

    remoteFile.createLocalFilePath();

    var directoryPath = path.dirname(remoteFile.getLocalFilePath());
    assert.equal(directoryPath, remoteFile.getLocalDirectoryName());
	});

  test("createLocalDir", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";
    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);
    remoteFile.createLocalFilePath();
    var directoryPath = remoteFile.getLocalDirectoryName();
    remoteFile.createLocalDir();

    assert.equal(true, fs.statSync(directoryPath).isDirectory());
	});

  test("getLocalFilePath", () => {
    var remoteFile = new RemoteFile();

    var hostname = "hostname";
    var remoteBasename = "somefile";
    remoteFile.setDisplayName(`${hostname}:${remoteBasename}`);

    assert.equal(undefined, remoteFile.getLocalFilePath());

    remoteFile.createLocalFilePath();

    var localFilePath = remoteFile.getLocalFilePath();

    assert.equal(true, localFilePath.startsWith(os.tmpdir()));
    assert.equal(true, localFilePath.endsWith(remoteBasename));

	});


  test("openSync", () => {
    var remoteFile = new RemoteFile();
	});

  test("closeSync", () => {
    var remoteFile = new RemoteFile();
	});

  test("writeSycn", () => {
    var remoteFile = new RemoteFile();
	});

  test("readFileSync", () => {
    var remoteFile = new RemoteFile();
	});

  test("appendData", () => {
    var remoteFile = new RemoteFile();
	});

  test("setDataSize", () => {
    var remoteFile = new RemoteFile();
	});

  test("getDataSize", () => {
    var remoteFile = new RemoteFile();
	});

  test("isEmpty", () => {
    var remoteFile = new RemoteFile();
	});

  test("isReady", () => {
    var remoteFile = new RemoteFile();
	});
});