import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember, Permissions, MessageAttachment } from "discord.js";
import { discordServers, discordUsers } from "../models/schema";

declare module "discord.js"{
    export interface GuildMember{
        _roles: Array<string>
    }
}

module.exports = {
    data : new SlashCommandBuilder()
        .setName('getusers')
        .setDescription("Gets all common name of verified users of joined server")
        .addBooleanOption(option => option.setName('email').setDescription('Get their student email').setRequired(false)),
    async execute(interaction: CommandInteraction){
        if(!interaction.inGuild()){
            await (interaction as CommandInteraction).reply("Unfortunately, this command cannot be used in a direct message.");
            return;
        }
        const member = interaction.member as GuildMember;
        await interaction.deferReply();
        const serverInfo = await discordServers.findOne({serverId : interaction.guildId});
        if(!member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && !serverInfo.administratorRoles.some(val => member._roles.includes(val))){
            await interaction.editReply({content: "You do not have permission to access this command."});
            return;
        }
        try{
            const joinedUsers = await interaction.guild.members.fetch();
            const header = "discordId,name" + (interaction.options.getBoolean('email') ? ',email\n' : '\n');
            const verifiedUsers = (await discordUsers.find()).filter(user => joinedUsers.has(user.discordId)).map(object => Object.values({
                discordId : object.discordId,
                name : object.name,
                ...(interaction.options.getBoolean('email')) && {email : object.email}
            }).join(',')).join('\n');
            await interaction.editReply({"content" : "Alright, autoname has been updated.", "files" : [new MessageAttachment(Buffer.from(header + verifiedUsers, "utf-8"), 'users.csv')]});
        }
        catch(err){
            console.log(err);
            await interaction.editReply({"content" : "Encountered an error while querrying for users, please try command again"});
        }
    }

}