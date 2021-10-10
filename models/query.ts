import client from '../index';
import Piscina from 'piscina';
import path from 'path';

export default async() => {
    const piscana = new Piscina({
        filename: path.resolve(__dirname, 'worker.js')
    });
    while(true){
        for(let [key, val] of client.guilds.cache){
            piscana.run(key);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}