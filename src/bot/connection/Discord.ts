import WebSocket from "ws";
import { EventEmitter } from 'node:events';
import debounce from "lodash.debounce";
import Message from "./Message";
import Connection from "./Connection";
import { Intents, Opcode } from "../../ts/enums";
import { WebsocketOptions } from "../../ts/interfaces";

export default class Discord extends EventEmitter{
    public static readonly DEFAULT_WS_OPTIONS : WebsocketOptions = {
        v : 10,
        encoding : "json"
    };

    private token : string;
    private wsOptions : WebsocketOptions;

    private connection : Connection;

    constructor(token : string, options = Discord.DEFAULT_WS_OPTIONS){
        super(EventEmitter);
        this.token = token;
        this.wsOptions = options;
        this.connection = new Connection(token, [Intents.GUILDS, Intents.GUILD_MESSAGES, Intents.DIRECT_MESSAGES, Intents.GUILD_MEMBERS], this.wsOptions);
    }
}

