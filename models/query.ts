import client from '../index';
import Piscina from 'piscina';
import path from 'path';

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
                piscana.run({serverId : key, myId : client.user.id})
                .catch((err) => {console.log(err)})
                .finally(() => {serversQuerrying[key] = false});
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}