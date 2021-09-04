import * as assert from 'assert';
import Command from '../../lib/Command';

describe("Command Tests", () => {

	describe("constructor()", () => {
    it('should set the name in constructor', () => {
      var name = "test";
      var command = new Command(name);
  
      assert.strictEqual(command.getName(), name);
    });
	});

  describe("setName()", () => {
    it('should set the name', () => {
      var name = "test";
      var command = new Command(name);
  
      var name = "another test";
      command.setName(name);
      assert.strictEqual(command.getName(), name);
    });
  });

  describe("getName()", () => {
    it('should return the name', () => {
      var name = "test";
      var command = new Command(name);
  
      var name = "another test";
      command.setName(name);
      assert.strictEqual(command.getName(), name);
    });
  });

  describe("addVariable()", () => {
    it('should add a variable', () => {
      var name = "test";
      var key = "variableKey";
      var value = "variableValue";
      var command = new Command(name);
  
      command.addVariable(key, value);
      assert.strictEqual(command.getVariable(key), value);
    });
  });

  describe("getVariable()", () => {
    it('should return the variable', () => {
      var name = "test";
      var key = "variableKey";
      var value = "variableValue";
      var command = new Command(name);
  
      command.addVariable(key, value);
      assert.strictEqual(command.getVariable(key), value);
    });
  });
});