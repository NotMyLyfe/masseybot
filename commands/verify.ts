require('dotenv').config();
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions } from "discord.js";
import { discordUsers } from "../models/schema";
import * as jwt from 'jsonwebtoken';
import sendmail from '../mail/sendmail';

module.exports = {
    data : new SlashCommandBuilder()
        .setName('verify')
        .setDescription("Verify yourself and associate yourself with your student ID")
        .addIntegerOption(option => option.setName('id').setDescription('Your student ID').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Your full name').setRequired(true)),
    async execute(interaction: CommandInteraction){
        const member = interaction.member as GuildMember;
        await interaction.deferReply({ ephemeral: true });
        if(!member){
            interaction.editReply("I'm sorry, commands in private messages are currently not supported.");
            return;
        }
        if(await discordUsers.exists({discordId:member.id})){
            interaction.editReply("You're already verified! No need to verify again! (If you're seeing this, but do not have access to the server, please contact an admin)");
            return;
        }
        const idString = interaction.options.getInteger('id').toString();
        if(idString.length != 8){
            interaction.editReply("Invalid student ID, please enter a valid student ID");
            return;
        }
        const token = jwt.sign({
            discordId: member.id,
            studentNumber: idString,
            name: interaction.options.getString('name')
        }, process.env.JWT_SECRET);
        const email = `${idString}@student.publicboard.ca`;
        sendmail(email, token, interaction.options.getString('name')).then(async () => {
            await interaction.editReply(`We have sent an email to ${idString}@student.publicboard.ca. Please check your Microsoft365 email and click the link to complete verification. If you do not see it in your Inbox, **check your Junk Email folder** and report it as not junk!`)
        })
        .catch(async () => {
            await interaction.editReply('There was an error sending your verification email. Please contact an admin.')
        });
    }

}