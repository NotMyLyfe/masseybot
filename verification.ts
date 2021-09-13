require('dotenv').config();
import express from 'express';
import jwt from 'jsonwebtoken';
import { discordUsers } from './models/schema';
import { RecaptchaV2 } from 'express-recaptcha/dist';

const recaptcha = new RecaptchaV2(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY);
const app = express();

export interface TokenInterface{
    discordId : string;
    studentNumber : string;
    name : string;
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/verify/:id', recaptcha.middleware.render, (req, res) => {
    res.render('index', { captcha : res.recaptcha });
});

app.post('/verify/:id', async(req, res) => {
    recaptcha.verify(req, async(err, data) => {
        if(!err){
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
                    res.render('index', {
                        data: "Alright! You have been verified!"
                    });
            }
            catch(err){
                res.render('index', {
                    error: "Token invalid, contact an admin"
                });
            }
        }
        else{
            res.render('index', {
                error: "Captcha invalid, please try again",
                path: req.path
            });
        }
    });
    
});

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
});
