import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions, Role } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('addadmin')
        .setDescription("Adds an administrator role to this bot")
        .addRoleOption(option => option.setName('admin').setDescription('New administrator role').setRequired(true)),
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
        const role = interaction.options.getRole('admin') as Role;
        if(interaction.guild.ownerId != member.id && member.roles.highest.comparePositionTo(role) <= 0){
            await interaction.editReply({content: "Unable to add role higher than or equal to your highest role."});
            return;
        }
        await discordServers.updateOne({serverId : interaction.guildId}, {$addToSet : {administratorRoles: role.id}});
        await interaction.editReply({"content" : "Alright, roles have been updated."});
    }

}
