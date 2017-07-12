import * as assert from 'assert';
import * as vscode from 'vscode';
import Command from '../src/lib/Command';

suite("Command Tests", () => {

	test("constructor", () => {
    var name = "test";
    var command = new Command(name);

		assert.equal(name, command.getName());
	});

  test("setName", () => {
    var name = "test";
    var command = new Command(name);

    var name = "another test";
    command.setName(name);
    assert.equal(name, command.getName());
  });

  test("getName", () => {
    var name = "test";
    var command = new Command(name);

    var name = "another test";
    command.setName(name);
    assert.equal(name, command.getName());
  });

  test("addVariable", () => {
    var name = "test";
    var key = "variableKey";
    var value = "variableValue";
    var command = new Command(name);

    command.addVariable(key, value);
    assert.equal(value, command.getVariable(key));
  });

  test("getVariable", () => {
    var name = "test";
    var key = "variableKey";
    var value = "variableValue";
    var command = new Command(name);

    command.addVariable(key, value);
    assert.equal(value, command.getVariable(key));
  });
});