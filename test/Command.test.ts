import * as assert from 'assert';

import * as vscode from 'vscode';
import Command from '../src/lib/Command';

suite("Command Tests", () => {

	test("constructor", () => {
    var name = "test";
    var command = new Command(name);

		assert.equal(name, command.getName());
		assert.equal(name, command.getName());
	});
});