import { discordServers, discordUsers } from './schema';
import client from '../index';

export default async() => {
    while(true){
        const users = await discordUsers.find();
        const servers = await discordServers.find();
        for(let [key, val] of client.guilds.cache){
            const serverDetails = servers.filter(server => server.serverId == key);
            if(serverDetails.length == 0){
                await discordServers.create({
                    serverId: key,
                    verifiedRole: "-1",
                    verificationChannels: [],
                    administratorRoles: []
                });
                continue;
            }
            
            const guild = await client.guilds.fetch(key);
            const verifiedRole = serverDetails[0].verifiedRole;
            if(verifiedRole == "-1") continue;
            const role = await guild.roles.fetch(verifiedRole);
            if(!role){
                guild.systemChannel.send("Verified role has been removed from the server, please update verified role.");
                await discordServers.updateOne({serverId : key}, {verifiedRole: "-1"});
                return;
            }
            if(guild.me.roles.highest.comparePositionTo(role) <= 0) {
                guild.systemChannel.send("Verified role is higher than the bot's highest role, please update verified role.");
                await discordServers.updateOne({serverId : key}, {verifiedRole: "-1"});
                return;
            }
            const members = await guild.members.fetch();

            for(let [mKey, mVal] of members){
                const userDetails = users.filter(user => user.discordId == mKey);
                if(userDetails.length == 0 || (mVal as any)._roles.includes(verifiedRole) || mVal.user.bot) continue;
                try{
                    if(guild.me.roles.highest.comparePositionTo(mVal.roles.highest) > 0 && guild.ownerId != mKey)
                        mVal.setNickname(userDetails[0].name);
                    else
                        guild.systemChannel.send(`User <@${mVal.id}> has a higher role, unable to change nickname.`);
                    mVal.roles.add(verifiedRole);
                }
                catch(err){
                    console.log(err);
                    continue;
                }
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}