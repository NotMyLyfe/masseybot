require('dotenv').config();
import * as fs from 'fs';

import { discordServers, discordUsers } from './models/schema';
import query from './models/query';
import { Client, Collection, Intents } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

declare module "discord.js"{
    export interface Client{
        commands: Collection<string, any>
    }
}

const client = new Client({
    intents: [Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

const commands = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const f of commandFiles){
    const command = require(`./commands/${f}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const rest = new REST({version: '9'}).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            //Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
    }
    catch(err){
        console.log(err);
    }
})();

client.on('ready', () => {
    console.log('Ready!');
    query();
});

client.on('guildCreate', async guild => {
    await discordServers.updateOne({serverId: guild.id}, {$setOnInsert: {
        serverId: guild.id,
        verifiedRole: "-1",
        verificationChannels: [],
        administratorRoles: []
    }}, {upsert: true}).catch(err => console.log(err));
});

client.on('guildMemberAdd', async member=>{
    const userInfo = await discordUsers.findOne({discordId : member.id});
    if(userInfo){
        const serverInfo = await discordServers.findOne({serverId : member.guild.id});
        member.send(`Welcome to ${member.guild.name}! Since you've already verified yourself with MasseyBot, no need to verify yourself again.`);
        try{
            member.setNickname(userInfo.name);
            if(serverInfo && serverInfo.verifiedRole != "-1" || member.guild.roles.cache.find(r => r.id == serverInfo.verifiedRole != undefined)){
                member.roles.add(serverInfo.verifiedRole);
            }
        }
        catch(err){
            console.log(err, member.permissions.has('MANAGE_ROLES'));
        }
    }
    else{
        member.send(`Welcome to ${member.guild.name}! Please verify yourself in the verification channel.`);
    }
});

client.on('interactionCreate', async interaction=>{
    if(!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if(!command) return;
    try{
        await command.execute(interaction);
    }
    catch(err){
        console.log(err);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

client.login(process.env.TOKEN);

export default client;
