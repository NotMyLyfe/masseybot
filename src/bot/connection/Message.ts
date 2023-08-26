import { Data } from "ws";
import { Intents, Opcode } from "../../ts/enums";
import { Identify, MessageJson } from "../../ts/interfaces";

export default class Message{
    public static heartbeat(d? : any){
        return new Message({op : Opcode.heartbeat, d : d ? d : null})
    }

    public static identify(id : Identify){
        return new Message({op : Opcode.identify, d : id})
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
    
    constructor(message : MessageJson){
        this._op = message.op;
        this._data = message.d;
        this._sequence = message.s;
        this._name = message.t;
    }

    public jsonify() : MessageJson{
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
