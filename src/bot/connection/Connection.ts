import WebSocket, { OPEN } from "ws";
import { EventEmitter } from "events";
import Message from "./Message";
import { MessageJson, WebsocketOptions } from "../../ts/interfaces";
import { EventCloseCode, EventName, Intent, Opcode } from "../../ts/enums";

export default class Connection extends EventEmitter{
    public static readonly GATEWAY_URL = new URL("wss://gateway.discord.gg/gateway/bot");
    
    private ws : WebSocket;
    private resume : boolean;
    private resume_url : string;
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
        this.ws = new WebSocket(Connection.urlMaker(options));
        this.resume = false;

        this.token = token;
        this.intents = intents.reduce((a, b) => a + b, 0);

        this.ws.on("open", () =>{
            this.ws.addEventListener("message", (message) => {
                this.receiveMessage(message);});
            this.ws.addEventListener("error", (error) => {this.errorHandler(error)});
        });

        this.ws.on("error", () => {
            throw new Error();
        });
    }

    private receiveMessage(message : WebSocket.MessageEvent) : void{
        const newMessage = new Message(JSON.parse(message.data.toString()) as MessageJson);
        this.handleMessage(newMessage);
    }

    private handleMessage(message : Message) : void{
        switch(message.op){
            case Opcode.dispatch:
                this.handleDispatch(message);
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
        this.heartbeatLoop();
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
                
            default:
                console.log(`Unknown event: ${message.name}`);
                break;
        }
    }

    private errorHandler(error : WebSocket.ErrorEvent) : void{
        console.log(error);
    }

    public async send(message : Message){
        if(this.ws.readyState === OPEN) this.ws.send(message.toString());
    }
}
