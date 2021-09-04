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
            const verifiedRole = serverDetails[0].verifiedRole;
            if(verifiedRole == "-1") continue;
            if(val.roles.cache.find(r => r.id == verifiedRole) == undefined){
                val.systemChannel.send("Verified role has been removed from the server, please update verified role.");
                await discordServers.updateOne({serverId : key}, {verifiedRole: "-1"});
                return;
            }
            
            client.guilds.fetch(key)
                .then(async guild => {
                    if(guild.me.roles.highest.comparePositionTo(await guild.roles.fetch(verifiedRole)) <= 0) return;
                    guild.members.fetch().then(member => {
                        for(let [mKey, mVal] of member){
                            const userDetails = users.filter(user => user.discordId == mKey);
                            if(userDetails.length == 0 || (mVal as any)._roles.includes(verifiedRole) || mVal.user.bot) continue;
                            try{
                                mVal.setNickname(userDetails[0].name);
                                mVal.roles.add(verifiedRole);
                            }
                            catch(err){
                                console.log(err);
                                continue;
                            }
                        }
                    });
            })
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}