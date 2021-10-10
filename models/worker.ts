import {discordServers, discordUsers} from './schema';
import client from '../index';

export default async (serverId : string) => {
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

    const autoName = serverDetails.autoName;
    const guild = await client.guilds.fetch(serverId);
    const verifiedRole = serverDetails.verifiedRole;
    
    if(verifiedRole == "-1") return;

    const role = await guild.roles.fetch(verifiedRole);
    const highestRoleMe = guild.me.roles.highest;

    if(!role){
        guild.systemChannel.send("Verified role has been removed from the server, please update verified role.")
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
            console.log(err);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }

    if(highestRoleMe.comparePositionTo(role) <= 0){
        guild.systemChannel.send("Verified role is higher than the bot's highest role, please update verified role.")
        .catch(err => {
            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
            console.log(err);
        });
        await discordServers.updateOne({serverId : guild.id}, {verifiedRole: "-1"});
        return;
    }

    try{
        const members = await guild.members.fetch({time : 120e3});
        const users = (await discordUsers.find()).filter(user => members.has(user.discordId));
        for (let user of users){
            const userGuild = members.get(user.discordId);
            if(userGuild.roles.cache.has(verifiedRole)) continue;
            try{
                if(autoName){
                    if(highestRoleMe.comparePositionTo(userGuild.roles.highest) > 0 && guild.ownerId != user.discordId){
                        await userGuild.setNickname(user.name);
                    }
                    else{
                        guild.systemChannel.send(`User <@${user.discordId}> has a higher role, unable to change nickname.`)
                        .catch(err => {
                            console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
                            console.log(err);
                        });
                    }
                }
                await userGuild.roles.add(verifiedRole);
            }
            catch(err){
                console.log(err);
                continue;
            }
        }
    }
    catch(err){
        return;
    }
};