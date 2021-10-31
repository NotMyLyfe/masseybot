require('dotenv').config();
import {discordServers, discordUsers} from '../models/schema';
import axios from 'axios';

const discordAPI = axios.create({
    baseURL: `https://discord.com/api/${process.env.API}`,
    headers: {
        'Authorization': `Bot ${process.env.TOKEN}`
    }
});

interface queryParams {
    serverId : string,
    myId : string
}

const _paginatedUserList = async (serverId: string) => {
    const users = {} as Record<string, any>;
    let lastReturned = 0;
    let lastUser = 0;

    const QUERY_LIMIT = 1000;

    do {
        const iterd = (await discordAPI({
            method: "GET",
            url: `/guilds/${serverId}/members`,
            params: {
                limit: QUERY_LIMIT,
                after: lastUser
            }
        })).data as Array<any>;
        lastReturned = iterd.length;

        const iterm = iterd.reduce((map, obj) => {
            map[obj.user.id] = obj.roles as Array<any>;
            return map;
        }, {});

        Object.assign(users, iterm);
        if(iterd.length > 0)
            lastUser = iterd.at(-1).user.id;
    }while (lastReturned == QUERY_LIMIT);

    return users;
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
    const guild = (await discordAPI(`/guilds/${serverId}`)).data;

    
    const roles = (guild.roles as Array<any>).reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {});
    
    const role = roles[verifiedRole];
    
    const systemChannel = guild["system_channel_id"];
    
    if(!role){
        discordAPI({
            method: "POST",
            url: `/channels/${systemChannel}/messages`,
            data: {
                content : "Verified role has been removed from the server, please update verified role."
            }
        })
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }
    
    const members = await _paginatedUserList(serverId);

    let highestRole = 0;
    members[myId].forEach(val => {
        const rolePos = roles[val].position;
        highestRole = (highestRole < rolePos) ? rolePos : highestRole;
    });

    if(highestRole <= role.position){
        discordAPI({
            method: "post",
            url: `/channels/${systemChannel}/messages`,
            data: {
                content : "Verified role is equal to or higher than the bot's highest role, please update verified role."
            }
        })
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }
        const users = (await discordUsers.find()).filter(user => user.discordId in members);

    for (let user of users){
        const userRoles = members[user.discordId];
        if(userRoles.includes(verifiedRole)) continue;

        const userHasHigherRole = userRoles.some(roleId => roles[roleId].position >= highestRole);
        const canName = guild.owner_id != user.discordId && !userHasHigherRole;

        discordAPI({
            method: "patch",
            url: `/guilds/${serverId}/members/${user.discordId}`,
            headers: {
                "Content-Type" : "application/json"
            },
            data: {
                "roles" : userRoles.concat([verifiedRole]),
                ...(autoName && canName) && {"nick" : user.name}
            }
        }).catch(err => {
            console.log(`Error modifying user ${user.discordId} during background sync on guild ${guild.id}!`);
        });
        if(autoName && !canName){
            discordAPI({
                method: "post",
                url: `/channels/${systemChannel}/messages`,
                data: {
                    content : `User <@${user.discordId}> has a higher role, unable to change nickname.`
                }
            })
            .catch(err => {
                console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
            });
        }
    }
};