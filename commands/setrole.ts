import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions, Role } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('setrole')
        .setDescription("Sets verified role for this server")
        .addRoleOption(option => option.setName('role').setDescription('Verified role').setRequired(true)),
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
        const role = interaction.options.getRole('role') as Role;
        if(role.rawPosition == 0){
            await interaction.editReply({content : "Role cannot be set to everyone"});
            return;
        }
        if(interaction.guild.me.roles.highest.comparePositionTo(role) <= 0){
            await interaction.editReply({content: "Role must be lower than bot's highest role"});
            return;
        }
        if(interaction.guild.ownerId != member.id && member.roles.highest.comparePositionTo(role) <= 0){
            await interaction.editReply({content: "Unable to set verified role higher than or equal to your highest role."});
            return;
        }
        await discordServers.updateOne({serverId : interaction.guildId}, {verifiedRole : role.id});
        await interaction.editReply({"content" : "Alright, verified role has been updated."});
    }
}