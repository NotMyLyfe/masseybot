import WebSocket from "ws";
import { EventEmitter } from "events";
import Message, { MessageJSON, OPCODE } from "./Message";

enum Intents{
    GUILDS = 1 << 0,
    GUILD_MEMBERS = 1 << 1,
    GUILD_MODERATION = 1 << 2,
    GUILD_EMOJIS_AND_STICKERS = 1 << 3,
    GUILD_INTEGRATIONS  = 1 << 4,
    GUILD_WEBHOOKS = 1 << 5,
    GUILD_INVITES = 1 << 6,
    GUILD_VOICE_STATES = 1 << 7,
    GUILD_PRESENCES = 1 << 8,
    GUILD_MESSAGES = 1 << 9,
    GUILD_MESSAGE_REACTIONS = 1 << 10,
    GUILD_MESSAGE_TYPING = 1 << 11,
    DIRECT_MESSAGES = 1 << 12,
    DIRECT_MESSAGE_REACTION = 1 << 13,
    DIRECT_MESSAGE_TYPING = 1 << 14,
    MESSAGE_CONTENT = 1 << 15,
    GUILD_SCHEDULE_EVENTS = 1 << 16,
    AUTO_MODERATION_CONFIGURATION = 1 << 20,
    AUTO_MODERATION_EXECUTION = 1 << 21
}

export default class Connection extends EventEmitter{
    public static readonly GATEWAY_URL = new URL("wss://gateway.discord.gg/gateway/bot");
    private ws : WebSocket;
    private resume : boolean;
    private resume_url : string;
    private seq : number;

    private heartbeat : {
        pulse : number,
        lastSend : Date,
        lastAck : Date
    }

    private static urlMaker(options : DiscordWSOptions) : string{
        const url = this.GATEWAY_URL;
        for(let [key, values] of Object.entries(options)){
            url.searchParams.append(key, values);
        }
        return url.toString();
    }

    constructor(options : DiscordWSOptions){
        super(EventEmitter);
        this.ws = new WebSocket(Connection.urlMaker(options));
        this.resume = false;
        this.ws.on("open", () =>{
            this.ws.addEventListener("message", (message) => {
                this.receiveMessage(message);});
            this.ws.addEventListener("error", (error) => {this.errorHandler(error)});
        });

        this.ws.on("error", () => {
            throw new Error();
        });
    }

    public login(token : string, intents? : Intents[]){
        let intentVal = intents ? intents.reduce((a, b) => a + b, 0) : 0;

    }

    private receiveMessage(message : WebSocket.MessageEvent) : void{
        const newMessage = new Message(JSON.parse(message.data.toString()) as MessageJSON);
        this.handleMessage(newMessage);
    }

    private handleMessage(message : Message) : void{
        switch(message.op){
            case OPCODE.hello:
                this.helloEvent(message);
                break;
            case OPCODE.heartbeat_ack:
                this.heartbeat.lastAck = new Date();
                break;
            default:
                console.log(`${message}`);
                break;
        }
    }
    
    private helloEvent(message : Message) {
        this.heartbeat = {
            pulse : message.data.heartbeat_interval,
            lastSend : new Date(0),
            lastAck : new Date(0)
        };
        this.heartbeatLoop();
    }

    private async heartbeatLoop(){
        setInterval(() => {
            this.heartbeat.lastSend = new Date();
            this.send(Message.heartbeat(this.seq));
        }, this.heartbeat.pulse);
    }

    private errorHandler(error : WebSocket.ErrorEvent) : void{
        console.log(error);
    }

    public async send(message : Message){
        this.ws.send(message.toString());
    }
}
