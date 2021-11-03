import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers, discordUsers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('ban')
        .setDescription("Ban student ID associated with user from this server")
        .addUserOption(option => option.setName('user').setDescription('User you would like to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason for ban?').setRequired(true))
        .addIntegerOption(option => option.setName('days').setDescription('Delete messages from this user from how many days ago (from 0-7)? By default, this is 7.').setRequired(false)),
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
        const days = (interaction.options.getInteger('days')) ? interaction.options.getInteger('days') : 7;
        if (days < 0 || days > 7){
            await interaction.editReply({content: `The number of days specified is invalid. You have specified ${days}, however, I can only accept values from 0-7 (inclusive).`});
            return;
        }
        const canBan = interaction.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS) || interaction.guild.me.permissions.has(Permissions.FLAGS.ADMINISTRATOR);
        try{
            const userId = interaction.options.getUser('user').id;
            if(interaction.guild.ownerId == userId){
                await interaction.editReply({"content" : `User <@${userId}> is the server owner, unable to ban.`});
                return;
            }
            const userGuild = await interaction.guild.members.fetch(userId);
            if(interaction.guild.ownerId != member.id && member.id != userId && member.roles.highest.comparePositionTo(userGuild.roles.highest) <= 0){
                await interaction.editReply({"content" : `User <@${userId}> has a role higher than or equal to your highest role, unable to ban.`});
                return;
            }
            if(interaction.guild.me.roles.highest.comparePositionTo(userGuild.roles.highest) <= 0){
                await interaction.editReply({"content" : `User <@${userId}> has a higher role than me, unable to ban.`});
                return;
            }
            const userInfo = (await discordUsers.find()).find(userQ => userQ.discordId == userId);
            if(!userInfo){
                await interaction.editReply({"content" : `User <@${userId}> is not verified, unable to ban user`});
                return;
            }
            await discordServers.updateOne({serverId : interaction.guildId}, {$addToSet : {bannedUsers: userInfo.email}});
            if(canBan){
                await userGuild.send(`Your student ID associated with your Discord account is currently banned from ${interaction.guild.name} due to: ${interaction.options.getString('reason')}. Please contact an admin for more help.`)
                .catch(err => {
                    console.log(`Unable to send message to user ${userGuild.id}, member possibly has private messages disabled?`);
                    console.log(err);
                });
                await userGuild.ban({
                    days: days,
                    reason: interaction.options.getString('reason')
                });
                await interaction.editReply({"content" : `Alright, user <@${userId}> has been banned and their student ID (${userInfo.email}) has been added to the blacklist.`});
            }
            else{
                if(serverInfo.verifiedRole != "-1")
                    await userGuild.roles.remove(serverInfo.verifiedRole);
                await userGuild.setNickname(null);
                await interaction.editReply({"content" : `Unable to ban user <@${userId}> (possibly due to missing perms?), however, their student ID (${userInfo.email}) has been added to the blacklist`});
            }
        }
        catch(err){
            await interaction.editReply({"content" : "Encountered an error while querrying for users, please try command again"});
        }
    }

}