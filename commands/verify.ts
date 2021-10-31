require('dotenv').config();
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { discordUsers } from "../models/schema";
import jwt from 'jsonwebtoken';
import sendmail from '../mail/sendmail';

module.exports = {
    data : new SlashCommandBuilder()
        .setName('verify')
        .setDescription("Verify yourself and associate yourself with your student ID")
        .addIntegerOption(option => option.setName('id').setDescription('Your student ID').setRequired(true))
        .addStringOption(option => option.setName('name').setDescription('Your full name (with capitalization)').setRequired(true))
        .addBooleanOption(option => option.setName('single').setDescription('Does your full name not include a last name?').setRequired(false)),
    async execute(interaction: CommandInteraction){
        const member = interaction.user;
        await interaction.deferReply({ ephemeral: interaction.inGuild() });
        if(await discordUsers.exists({discordId:member.id})){
            interaction.editReply("You're already verified! No need to verify again! (If you're seeing this, but do not have access to the server, please contact an admin)");
            return;
        }
        const idString = interaction.options.getInteger('id').toString();
        if(idString.length != 8){
            interaction.editReply("Invalid student ID, please enter a valid student ID");
            return;
        }
        const email = `${idString}@student.publicboard.ca`;
        if(await discordUsers.exists({email : email})){
            interaction.editReply("This student ID has already been used! If you no longer have access to the account you initially verified yourself with, or require more than one account, please contact an admin.");
            return;
        }
        const name = interaction.options.getString('name');
        if(!interaction.options.getBoolean('single') && name.split(' ').length < 2){
            interaction.editReply("Did you forget to include both your first and last name? If your name doesn't include a last name, set the 'single' property to true");
            return;
        }
        const token = jwt.sign({
            discordId: member.id,
            studentNumber: idString,
            name: name
        }, process.env.JWT_SECRET);
        sendmail(email, token, name).then(async () => {
            await interaction.editReply(`We have sent an email to ${idString}@student.publicboard.ca. Please check your Microsoft365 email and click the link to complete verification. If you do not see it in your Inbox, **check your Junk Email folder** and report it as not junk!`)
        })
        .catch(async () => {
            await interaction.editReply('There was an error sending your verification email. Please contact an admin.')
        });
    }

}