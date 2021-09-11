require('dotenv').config();
import express from 'express';
import jwt from 'jsonwebtoken';
import { discordUsers } from './models/schema';

const app = express();

export interface TokenInterface{
    discordId : string;
    studentNumber : string;
    name : string;
}

app.get('/verify/:id', async(req, res, next) => {
    try{
        let decoded = jwt.verify(req.params.id, process.env.JWT_SECRET) as TokenInterface;
        let discordId = decoded.discordId;
        let studentNumber = decoded.studentNumber;
        let fullname = decoded.name;
        await discordUsers.findOneAndUpdate({discordId : discordId}, 
            {   
                name : fullname,
                discordId: discordId,
                email: `${studentNumber}@student.publicboard.ca`
            },
            { new : true, upsert: true});
        res.status(200).send("Alright! You have been verified!");
    }
    catch(err){
        return next(err);
    }
});

app.use(function(err, req, res, next) {
    console.log(err);
    res.status(500).send('Token is invalid');
});

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
});
