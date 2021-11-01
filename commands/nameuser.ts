import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers, discordUsers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('nameuser')
        .setDescription("Rename a verified users to their full name")
        .addUserOption(option => option.setName('user').setDescription('User you would like to update').setRequired(true))
        .addBooleanOption(option => option.setName('reset').setDescription('Reset nickname back to their Discord name?').setRequired(false)),
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
            const userId = interaction.options.getUser('user').id;
            if(interaction.guild.ownerId == userId){
                await interaction.editReply({"content" : `User <@${userId}> is the server owner, unable to change nickname.`});
                return;
            }
            const userGuild = await interaction.guild.members.fetch(userId);
            if(interaction.guild.ownerId != member.id && member.id != userId && member.roles.highest.comparePositionTo(userGuild.roles.highest) <= 0){
                await interaction.editReply({"content" : `User <@${userId}> has a role higher than or equal to your highest role, unable to change nickname.`});
                return;
            }
            if(interaction.guild.me.roles.highest.comparePositionTo(userGuild.roles.highest) <= 0){
                await interaction.editReply({"content" : `User <@${userId}> has a higher role, unable to change nickname.`});
                return;
            }
            const userInfo = (await discordUsers.find()).find(userQ => userQ.discordId == userId);
            if(!userInfo){
                await interaction.editReply({"content" : "User is not verified, unable to update name"});
                return;
            }
            await userGuild.setNickname(interaction.options.getBoolean('reset') ? null : userInfo.name);
            await interaction.editReply({"content" : `Alright, user <@${userId}>'s name has been updated.`});
        }
        catch(err){
            await interaction.editReply({"content" : "Encountered an error while querrying for users, please try command again"});
        }
    }

}