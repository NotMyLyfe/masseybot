import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers, discordUsers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('nameall')
        .setDescription("Rename all verified users to their full name")
        .addBooleanOption(option => option.setName('reset').setDescription('Reset all nicknames back to their Discord names?').setRequired(false)),
    async execute(interaction: CommandInteraction){
        if(!interaction.inGuild()){
            await (interaction as CommandInteraction).reply("Unfortunately, this command cannot be used in a direct message.");
            return;
        }
        const member = interaction.member as GuildMember;
        await interaction.deferReply();
        const serverInfo = await discordServers.findOne({serverId : interaction.guildId});
        if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !serverInfo.administratorRoles.some(val => member.roles.cache.has(val))){
            await interaction.editReply({content: "You do not have permission to access this command."});
            return;
        }
        try{
            const joinedUsers = await interaction.guild.members.fetch();
            const verifiedUsers = (await discordUsers.find()).filter(user => joinedUsers.has(user.discordId));
            const botHighestRole = interaction.guild.me.roles.highest;
            for(let user of verifiedUsers){
                const userGuild = joinedUsers.get(user.discordId);
                if(botHighestRole.comparePositionTo(userGuild.roles.highest) > 0 && interaction.guild.ownerId != user.discordId){
                    await userGuild.setNickname(interaction.options.getBoolean('reset') ? null : user.name);
                }
                else{
                    interaction.guild.systemChannel.send(`User <@${user.discordId}> has a higher role, unable to change nickname.`)
                    .catch(err => {
                        console.log(`Unable to send message to guild ${interaction.guildId}, possibly missing perms to send commands in the guild system channel?`);
                        console.log(err);
                    });
                }
            }
            await interaction.editReply({"content" : "Alright, all the names of verified users have been updated."});
        }
        catch(err){
            await interaction.editReply({"content" : "Encountered an error while querrying for users, please try command again"});
        }
    }

}