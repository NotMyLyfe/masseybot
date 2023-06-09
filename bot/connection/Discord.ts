import WebSocket from "ws";
import Message from "./Message";

const GATEWAY_URL = "wss://gateway.discord.gg/"

export default class Discord{

    private connection : WebSocket;
    private pulse : number;

    constructor(token : string, version = 10, encoding = "json", compress? : string,){
        this.connection = new WebSocket(`${GATEWAY_URL}?v=${version}&encoding=${encoding}${compress && `&compress=${compress}`}`);
        this.connection.on("open", () =>{
            this.connection.addEventListener("message", this.receiveMessage);
            this.connection.addEventListener("error", this.errorHandler);
            //this.ping();
        });

        this.connection.on("error", () => {
            throw new Error();
        });
        
    }

    private setPulseOnInit() {

    }

    private receiveMessage(message : WebSocket.MessageEvent) : void{
        new Message(message.data);
    }

    private handleMessage() : void{

    }

    private errorHandler(error : WebSocket.ErrorEvent) : void{
        
    }

    private async ping(){
        while(true){
            await new Promise ((resolve) => {setTimeout(resolve, this.pulse)});
            this.connection.ping({"op" : 11})
        }
    }

    public async send(){

    }
}

const discordConnection = new Discord("");
