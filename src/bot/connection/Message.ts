import { Data } from "ws";

export enum OPCODE{
    dispatch = 0,
    heartbeat = 1,
    identify = 2,
    presence_update = 3,
    voice_state_update = 4,
    resume = 6,
    reconnect = 7,
    req_guild_mem = 8,
    inv_session = 9,
    hello = 10,
    heartbeat_ack = 11
}

export interface MessageJSON{
    op: number,
    d?: any,
    s?: number,
    t?: string
}

export default class Message{
    public static heartbeat(d? : any){
        return new Message({op : OPCODE.heartbeat, d : d ? d : null})
    }

    private _op: number;
    private _data?: any;
    private _sequence?: number;
    private _name?: string;

    get op(){
        return this._op;
    }
    
    get data(){
        return this._data;
    }

    get sequence(){
        return this._sequence;
    }

    get name(){
        return this._name;
    }
    
    constructor(message : MessageJSON){
        this._op = message.op;
        this._data = message.d;
        this._sequence = message.s;
        this._name = message.t;
    }

    public jsonify() : MessageJSON{
        return { op: this._op, 
                 ...(this._data !== undefined && {d : this._data}),
                 ...(this._sequence && {s : this._sequence}),
                 ...(this._name && {t : this._name})
                };
    }

    public toString() : string{
        return JSON.stringify(this.jsonify());
    }
}
