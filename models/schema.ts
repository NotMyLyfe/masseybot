require('dotenv').config();
import mongoose from 'mongoose';
import Piscina from 'piscina';

mongoose.connect(process.env.DB_URL).then(() => {
    if(!Piscina.isWorkerThread)
        console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("Error connecting to MongoDB!", err);
})

interface userSchema extends mongoose.Document{
    name: string;
    discordId: string;
    email: string;
}

interface serverSchema extends mongoose.Document{
    serverId: string;
    verifiedRole: string;
    administratorRoles: Array<string>;
    autoName: boolean;
    bannedUsers : Array<string>;
}

const discordUsers = mongoose.model<userSchema>('DiscordUser', new mongoose.Schema<userSchema>({
    name: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
}));

const discordServers = mongoose.model<serverSchema>('DiscordServer', new mongoose.Schema<serverSchema>({
    serverId:{
        type: String,
        required: true
    },
    verifiedRole:{
        type: String,
        required: true
    },
    administratorRoles: {
        type: [String],
        required: true
    },
    autoName : {
        type: Boolean,
        required: true
    },
    bannedUsers : {
        type : [String], 
        required: true
    }
}));

export {discordServers, discordUsers};