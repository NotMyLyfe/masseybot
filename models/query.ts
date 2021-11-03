require('dotenv').config();
import client from '../index';
import Piscina from 'piscina';
import path from 'path';
import { Permissions } from 'discord.js';

export default async() => {
    if (Piscina.isWorkerThread) return;
    const serversQuerrying = {};
    const piscana = new Piscina({
        filename: path.resolve(__dirname, '../workers/worker.js')
    });
    while(true){
        for(let [key, val] of client.guilds.cache){
            if(!serversQuerrying[key]){
                serversQuerrying[key] = true;
                piscana.run({serverId : key, myId : client.user.id, canBan: val.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS) || val.me.permissions.has(Permissions.FLAGS.ADMINISTRATOR)})
                .catch((err) => {console.log(err)})
                .finally(() => {serversQuerrying[key] = false});
            }
        }
        await new Promise(resolve => setTimeout(resolve, Number(process.env.QUERY_TIME)));
    }
}