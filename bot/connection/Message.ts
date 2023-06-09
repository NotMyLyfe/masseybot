import { Data } from "ws";

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
        const rawEvent = JSON.parse(message.toString());
    }
}
