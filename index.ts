require('dotenv').config();
import fs from 'fs';

import { discordServers, discordUsers } from './models/schema';
import query from './models/query';
import { Client, Collection, Intents, Guild } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

declare module "discord.js"{
    export interface Client{
        commands: Collection<string, any>
    }
}

const client = new Client({
    intents: [Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES,"GUILD_MEMBERS"]
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

client.on('guildCreate', async (guild : Guild) => {
    guild.systemChannel.send("Thank you for using MasseyBot. To start, please add a verified role by using the \`/setrole\` command")
    .catch(err => {
        console.log(`Unable to send message to guild ${guild.id}, possibly missing perms to send commands in the guild system channel?`);
        console.log(err);
    });
});

client.on('guildMemberAdd', async member=>{
    const userInfo = await discordUsers.findOne({discordId : member.id});
    if(userInfo){
        const serverInfo = await discordServers.findOne({serverId : member.guild.id});
        if(serverInfo.verifiedRole == "-1"){
            member.send(`Welcome to ${member.guild.name}! A verified role has yet to be selected on this server, but since you've already verified yourself, you will be automatically verified once a role has been selected!`)
            .catch(err => {
                console.log(`Unable to send message to user ${member.id}, member possibly has private messages disabled?`);
                console.log(err);
            });
        }
        else{
            member.send(`Welcome to ${member.guild.name}! Since you've already verified yourself with MasseyBot, no need to verify yourself again.`)
            .catch(err => {
                console.log(`Unable to send message to user ${member.id}, member possibly has private messages disabled?`);
                console.log(err);
            });
            try{
                if(serverInfo.autoName)
                    await member.setNickname(userInfo.name);
                await member.roles.add(serverInfo.verifiedRole);
            }
            catch(err){
                console.log(err);
            }
        }
    }
    else{
        member.send(`Welcome to ${member.guild.name}! Please verify yourself in the verification channel.`)
        .catch(err => {
            console.log(`Unable to send message to user ${member.id}, member possibly has private messages disabled?`);
            console.log(err);
        });
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
