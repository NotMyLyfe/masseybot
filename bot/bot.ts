require('dotenv').config();
import WebSocket from 'ws';

const GATEWAY_URL = "wss://gateway.discord.gg/"
const discordWS = new WebSocket(`${GATEWAY_URL}?v=10&encoding=json`);

discordWS.on("open", () => {
    
});

discordWS.on("message", (data, isBinary) => {
    const message = isBinary ? data : data.toString();
    console.log(message);
});
