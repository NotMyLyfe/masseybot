import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers } from "../models/schema";

declare module "discord.js"{
    export interface GuildMember{
        _roles: Array<string>
    }
}

module.exports = {
    data : new SlashCommandBuilder()
        .setName('addadmin')
        .setDescription("Adds an administrator role to this bot")
        .addRoleOption(option => option.setName('admin').setDescription('New administrator role').setRequired(true)),
    async execute(interaction: CommandInteraction){
        const member = interaction.member as GuildMember;
        await interaction.deferReply();
        const serverInfo = await discordServers.findOne({serverId : interaction.guildId});
        if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !serverInfo.administratorRoles.some(val => member._roles.includes(val))){
            await interaction.editReply({content: "You do not have permission to access this command."});
            return;
        }
        await discordServers.updateOne({serverId : interaction.guildId}, {$addToSet : {administratorRoles: interaction.options.getRole('admin').id}});
        await interaction.editReply({"content" : "Alright, roles have been updated."});
    }

}