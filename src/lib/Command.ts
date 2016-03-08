import Logger from '../utils/Logger';

const L = Logger.getLogger('Command');

class Command {
  name : string;
  variables : Map<string, any>;
  dataSize : number;
  data: string;

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

  setDateSize(dataSize : number) {
    L.trace('setDateSize', dataSize);
    this.dataSize = dataSize;
  }

  getDataSize() : number {
    L.trace('getDataSize');
    L.debug('getDataSize', this.dataSize);
    return this.dataSize;
  }

  setData(data : string) {
    L.trace('setData');
    var bufferData = new Buffer(data, 'utf8');
    this.data = bufferData.slice(0, this.getDataSize()).toString('utf8');
  }

  appendData(data : string) {
    L.trace('appendData');
    data = (this.data || "") + data;
    this.setData(data);
  }

  getData() : string {
    L.trace('getData');
    return this.data;
  }

  isEmpty() : boolean {
    L.trace('isEmpty');
    L.debug('isEmpty?', this.dataSize == null);
    return this.dataSize == null;
  }

  isReady() : boolean {
    L.trace('isReady');
    L.debug('isReady?', this.data != null && Buffer.byteLength(this.data, 'utf8') == this.dataSize);
    return this.data != null && Buffer.byteLength(this.data, 'utf8') == this.dataSize;
  }

  toString() : string {
    return `Command:${this.getName()}`;
  }
}

export default Command;