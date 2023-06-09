import { Data } from "ws";

export interface MessageJSON{
    op: number,
    d?: any,
    s?: number,
    t?: string
}

export default class Message{
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

    constructor(message : Data){
        const rawEvent = JSON.parse(message.toString()) as MessageJSON;
        this._op = rawEvent.op;
        this._data = rawEvent.d;
        this._sequence = rawEvent.s;
        this._name = rawEvent.t;
    }

    public jsonify() : MessageJSON{
        return { op: this._op, 
                 ...(this._data && {d : this._data}),
                 ...(this._sequence && {s : this._sequence}),
                 ...(this._name && {t : this._name})
                };
    }

    public toString() : string{
        return JSON.stringify(this.jsonify());
    }
}
