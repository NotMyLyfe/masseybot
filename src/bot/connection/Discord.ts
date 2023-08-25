import WebSocket from "ws";
import { EventEmitter } from 'node:events';
import debounce from "lodash.debounce";
import Message, { MessageJSON, OPCODE } from "./Message";
import Connection from "./Connection";

export default class Discord extends EventEmitter{
    public static readonly DEFAULT_WS_OPTIONS : DiscordWSOptions = {
        v : 10,
        encoding : "json"
    };

    private token : string;
    private wsOptions : DiscordWSOptions;

    private connection : Connection;

    constructor(token : string, options = Discord.DEFAULT_WS_OPTIONS){
        super(EventEmitter);
        this.token = token;
        this.wsOptions = options;
        this.connection = new Connection(this.wsOptions);
    }

    public login(){
    }
}

