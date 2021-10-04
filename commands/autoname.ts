import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordServers } from "../models/schema";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('autoname')
        .setDescription("Sets whether or not users should be renamed to their full name upon being verified")
        .addBooleanOption(option => option.setName('boolean').setDescription('True or False?').setRequired(true)),
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
        await discordServers.updateOne({serverId : interaction.guildId}, {autoName: interaction.options.getBoolean('boolean')});
        await interaction.editReply({"content" : "Alright, autoname has been updated."});
    }

}