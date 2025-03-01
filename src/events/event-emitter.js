import EventEmitter from "events";

class CustomEventEmitter extends EventEmitter {}

const eventEmitter = new CustomEventEmitter();

export default eventEmitter;
