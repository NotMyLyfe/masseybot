import WebSocket, { OPEN } from "ws";
import { EventEmitter } from "events";
import Message from "./Message";
import { MessageJson, WebsocketOptions, Ready, User, Application } from "../../ts/interfaces";
import { EventCloseCode, EventName, Intent, Opcode } from "../../ts/enums";

declare interface WSConnection {
    on(event: "ready", listener: (ready : Ready) => void) : this;
    on(event: "close", listener: (code : EventCloseCode) => void) : this;
}

class WSConnection extends EventEmitter{
    public static readonly GATEWAY_URL = new URL("wss://gateway.discord.gg/");
    
    private ws : WebSocket;

    private user : User;
    private resume : boolean;
    private session_id : string;
    private resume_url : string;
    private application : Application;
    
    private seq : number;

    private token : string;
    private intents : number;

    private heartbeat : {
        pulse : number,
        lastSend : Date,
        lastAck : Date
    }

    private static urlMaker(options : WebsocketOptions) : string{
        const url = this.GATEWAY_URL;
        for(let [key, values] of Object.entries(options)){
            url.searchParams.append(key, values);
        }
        return url.toString();
    }

    constructor(token : string, intents : Intent[], options : WebsocketOptions){
        super(EventEmitter);
        this.ws = new WebSocket(WSConnection.urlMaker(options));
        this.resume = false;

        this.token = token;
        this.intents = intents.reduce((a, b) => a + b, 0);

        this.ws.on("open", () =>{
            this.ws.addEventListener("message", (message) => {
                this.receiveMessage(message);});
            this.ws.addEventListener("error", (error) => {this.errorHandler(error)});
            this.ws.addEventListener("close", (closeEvent : WebSocket.CloseEvent) => {
                this.handleClose(closeEvent);
            });
        });
    }

    private receiveMessage(message : WebSocket.MessageEvent) : void{
        const newMessage = new Message(JSON.parse(message.data.toString()) as MessageJson);
        this.handleMessage(newMessage);
    }

    private handleMessage(message : Message) : void{
        this.seq = message.sequence ? message.sequence : this.seq;
        switch(message.op){
            case Opcode.dispatch:
                this.handleDispatch(message);
                break;
            case Opcode.inv_session:
                if(message.data === true){
                    this.resume = true;
                }
                this.handleResume();
                break;
            case Opcode.hello:
                this.helloEvent(message);
                break;
            case Opcode.heartbeat_ack:
                this.heartbeat.lastAck = new Date();
                break;
            default:
                console.log(`${message}`);
                break;
        }
    }

    private login(){
        const identify = Message.identify({
            token : this.token,
            properties : {
                os: process.platform,
                browser : "MasseyBot",
                device : "MasseyBot"
            },
            intents : this.intents
        });

        this.send(identify);
    }

    private helloEvent(message : Message) {
        this.heartbeat = {
            pulse : message.data.heartbeat_interval,
            lastSend : new Date(0),
            lastAck : new Date(0)
        };
        setTimeout(() => this.heartbeatLoop(), Math.random() * this.heartbeat.pulse);
        this.login();
    }

    private heartbeatLoop(){
        setInterval(() => {
            this.heartbeat.lastSend = new Date();
            this.send(Message.heartbeat(this.seq));
        }, this.heartbeat.pulse);
    }

    private handleDispatch(message : Message) : void{
        switch (message.name) {
            case EventName.READY:
                const ready = message.data as Ready;
                this.resume_url = ready.resume_gateway_url;
                this.session_id = ready.session_id;
                this.user = ready.user;
                this.session_id = ready.session_id;
                this.emit("ready", ready);
                break;
            default:
                console.log(`Unknown event: ${message.name}`);
                break;
        }
    }

    private handleResume() : void{
    }

    private reconnect() : void{
        console.log("Resume!");
    }

    private handleClose(closeEvent : WebSocket.CloseEvent) : void{
        switch(closeEvent.code){
            case EventCloseCode.UNKNOWN_ERROR:
                console.log("Unknown error");
                this.reconnect();
                break;
        }
    }

    private errorHandler(error : WebSocket.ErrorEvent) : void{
        console.log(error);
    }

    public async send(message : Message){
        if(this.ws.readyState === OPEN) return this.ws.send(message.toString());
    }
}

export { WSConnection as default };
