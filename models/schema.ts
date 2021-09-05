require('dotenv').config();
import * as mongoose from 'mongoose';

mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;

db.on('open', () => {
    console.log("Connected to MongoDB");
});

db.on('error', err => console.log(err));

interface userSchema extends mongoose.Document{
    name: string;
    discordId: string;
    studentId: number;
};

interface serverSchema extends mongoose.Document{
    serverId: string;
    verifiedRole: string;
    administratorRoles: Array<string>;
};

const discordUsers = mongoose.model<userSchema>('DiscordUser', new mongoose.Schema<userSchema>({
    name: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        required: true
    },
    studentId: {
        type: Number,
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
    }
}));

export {discordServers, discordUsers};