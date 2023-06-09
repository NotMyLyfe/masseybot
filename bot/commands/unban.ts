import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('unban')
        .setDescription("Unban student ID associated with user from this server")
        .addIntegerOption(option => option.setName('id').setDescription('Student ID you would like to unban').setRequired(true)),
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
        const idString = interaction.options.getInteger('id').toString();
        if(idString.length != 8){
            interaction.editReply("Invalid student ID, please enter a valid student ID");
            return;
        }
        const email = `${idString}@student.publicboard.ca`;
        await discordServers.updateOne({serverId : interaction.guildId}, {$pull : {bannedUsers: email}});
        await interaction.editReply({content: `Alright, student ID ${idString} has been unbanned`});
    }

}
