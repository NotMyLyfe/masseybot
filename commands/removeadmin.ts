import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('removeadmin')
        .setDescription("Removes an administrator role from this bot")
        .addRoleOption(option => option.setName('admin').setDescription('Existing administrator role').setRequired(true)),
    async execute(interaction: CommandInteraction){
        const member = interaction.member as GuildMember;
        await interaction.deferReply();
        const serverInfo = await discordServers.findOne({serverId : interaction.guildId});
        if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !serverInfo.administratorRoles.some(val => (member as any)._roles.includes(val))){
            await interaction.editReply({content: "You do not have permission to access this command."});
            return;
        }
        await discordServers.updateOne({serverId : interaction.guildId}, {$pull : {administratorRoles: interaction.options.getRole('admin').id}});
        await interaction.editReply({"content" : "Alright, roles have been updated."});
    }

}