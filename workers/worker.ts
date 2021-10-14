require('dotenv').config();
import {discordServers, discordUsers} from '../models/schema';
import axios, { Method } from 'axios';

const discordAPI = async (method : Method, endpoint : string, data? : any, headers? : any) => {
    return axios({
        method : method,
        url : `https://discord.com/api/${process.env.API}${endpoint}`,
        headers:{
            'Authorization' : `Bot ${process.env.TOKEN}`,
            ...headers
        },
        ...(data) && {data : data}
    });
}

interface queryParams {
    serverId : string,
    myId : string
}

export default async ({serverId, myId} : queryParams) => {
    const serverDetails = await discordServers.findOne({'serverId' : serverId});
    if(!serverDetails){
        await discordServers.create({
            serverId: serverId,
            verifiedRole: "-1",
            verificationChannels: [],
            administratorRoles: [],
            autoName: true
        });
        return;
    }

    const verifiedRole = serverDetails.verifiedRole;
    if(verifiedRole == "-1") return;

    const autoName = serverDetails.autoName;
    const guild = (await discordAPI('get', `/guilds/${serverId}`)).data;
    const roles = (guild.roles as Array<any>).reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {});

    const role = roles[verifiedRole];

    const systemChannel = guild["system_channel_id"];

    if(!role){
        discordAPI('post', `/channels/${systemChannel}/messages`, {content : "Verified role has been removed from the server, please update verified role."})
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }

    let highestRole = 0;
    (await discordAPI('get', `/guilds/${serverId}/members/${myId}`)).data.roles.forEach(val => {
        const rolePos = roles[val].position;
        highestRole = (highestRole < rolePos) ? rolePos : highestRole;
    });

    if(highestRole <= role.position){
        discordAPI('post', `/channels/${systemChannel}/messages`, {content : "Verified role is equal to or higher than the bot's highest role, please update verified role."})
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }

    try{
        const members = (await discordAPI('get', `/guilds/${serverId}/members?limit=1000`)).data as Array<any>;
        const users = (await discordUsers.find()).filter(user => members.some(memberObj => memberObj.user.id == user.discordId));

        for (let user of users){
            try{
                const userRoles = (await discordAPI('get', `/guilds/${serverId}/members/${user.discordId}`)).data.roles as Array<any>;
                if(userRoles.includes(verifiedRole)) continue;
                
                const userHasHigherRole = userRoles.some(obj => obj.position >= highestRole);
                const canName = guild.owner_id != user.discordId && !userHasHigherRole;

                discordAPI('patch', `/guilds/${serverId}/members/${user.discordId}`, {
                    "roles" : userRoles.concat([verifiedRole]), 
                    ...(autoName && canName) && {"nick" : user.name}
                }, {"Content-Type" : "application/json"});
                if(autoName && !canName){
                    discordAPI('post', `/channels/${systemChannel}/messages`, {content : `User <@${user.discordId}> has a higher role, unable to change nickname.`})
                    .catch(err => {
                        console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
                    });
                }
            }
            catch(err){
                continue;
            }
        }
    }
    catch(err){
        return;
    }
};