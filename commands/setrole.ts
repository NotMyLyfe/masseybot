import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions, Role } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('setrole')
        .setDescription("Sets verified role for this server")
        .addRoleOption(option => option.setName('role').setDescription('Verified role').setRequired(true)),
    async execute(interaction: CommandInteraction){
        const member = interaction.member as GuildMember;
        await interaction.deferReply();
        const serverInfo = await discordServers.findOne({serverId : interaction.guildId});
        if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !serverInfo.administratorRoles.some(val => (member as any)._roles.includes(val))){
            await interaction.editReply({content: "You do not have permission to access this command."});
            return;
        }
        if(interaction.guild.me.roles.highest.comparePositionTo(interaction.options.getRole('role') as Role) <= 0){
            await interaction.editReply({content: "Role must be lower than bot's highest role"});
            return;
        }
        await discordServers.updateOne({serverId : interaction.guildId}, {verifiedRole : interaction.options.getRole('role').id});
        await interaction.editReply({"content" : "Alright, verified role has been updated."});
    }
}