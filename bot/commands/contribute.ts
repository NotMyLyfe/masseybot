import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
    data : new SlashCommandBuilder()
        .setName('contribute')
        .setDescription("Get link to help contribute to the development of MasseyBot"),
    async execute(interaction: CommandInteraction){
        await interaction.reply({
            content: "Support the development of MasseyBot by heading over to https://github.com/NotMyLyfe/masseybot !",
            ephemeral : interaction.inGuild()
        });
    }
}