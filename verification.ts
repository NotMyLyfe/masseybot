require('dotenv').config();
import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import exphbs from 'express-handlebars';
import qs from 'qs';
import { discordUsers } from './models/schema';

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

app.engine('handlebars', exphbs({
    extname: "hbs",
    defaultLayout: "",
    layoutsDir: ""
}));
app.set('view engine', 'handlebars');

app.get('/verify/:id', (req, res) => {
    res.render('verify', { captcha : process.env.HCAPTCHA_SITE_KEY});
});

app.post('/verify/:id', async(req, res) => {
    if(!req.body['h-captcha-response']){
        return res.render('verify', {
            captcha : process.env.HCAPTCHA_SITE_KEY,
            error : "Invalid captcha, please try again"
        });
    }

    axios({
        method: 'POST',
        url: `https://hcaptcha.com/siteverify`,
        data: qs.stringify({
            response : req.body['h-captcha-response'],
            secret : process.env.HCAPTCHA_SECRET_KEY
        }),
        headers: { 'Content-Type':'application/x-www-form-urlencoded' }
    })
    .then(async response => {
        if(response.data.success){
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
                    res.render('verify', {
                        success: true,
                        redirect : process.env.REDIRECT_URL
                    });
            }
            catch(err){
                res.render('verify', {
                    error: "Invalid token, contact an admin"
                });
            }
        }
        else{
            res.render('verify', {
                captcha : process.env.HCAPTCHA_SITE_KEY,
                error : "Captcha error, please try again"
            });
        }
    })
    .catch(err => {
        res.render('verify', {
            captcha : process.env.HCAPTCHA_SITE_KEY,
            error : "Captcha error, please try again"
        });
    });
});

app.use((req, res) => {
    res.redirect(process.env.REDIRECT_URL);
})

app.listen(3000, ()=>{
    console.log('Listening on port 3000');
});
