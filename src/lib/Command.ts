import Logger from '../utils/Logger';
import RemoteFile from './RemoteFile';

const L = Logger.getLogger('Command');

class Command {
  name : string;
  variables : Map<string, any>;

  constructor(name : string) {
    L.trace('constructor', name);
    this.variables = new Map();
    this.setName(name);
  }

  setName(name : string) {
    L.trace('setName', name);
    this.name = name;
  }

  getName() : string {
    L.trace('getName');
    return this.name;
  }

  addVariable(key : string, value : any) {
    L.trace('addVariable', key, value);
    this.variables.set(key, value);
  }

  getVariable(key : string) : any {
    L.trace('getVariable', key);
    return this.variables.get(key);
  }
}

export default Command;