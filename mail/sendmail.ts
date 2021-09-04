require('dotenv').config();
const mailgun = require('mailgun-js')({apiKey: process.env.MAILGUN_APIKEY, domain: process.env.DOMAIN});
export default function (email : string, token : string, name : string){
    return new Promise(function(resolve, reject){
        let link = `${process.env.VERIFY_URL}${token}`
        console.log(link);
        const msg = {
            to: email,
            from: process.env.FROM_EMAIL, // Use the email address or domain you verified above
            subject: 'Vincent Massey Discord Club Verification',
            text: `Hello ${name}!\n\nThank you for joining a club here at Vincent Massey Secondary School on Discord.\n\nIn order to maintain member privacy and security, we are requiring all users to verify themselves with their student email. To complete your account verification, please visit ${link} .\n\nIf you are in need of any assistance, please contact a Discord administrator. We look forward to another year at Vincent Massey!`,
            html: `Hello ${name}!<br><br>Thank you for joining a club here at Vincent Massey Secondary School on Discord.<br><br>In order to maintain member privacy and security, we are requiring all users to verify themselves with their student email. To complete your account verification, please <a href="${link}">click here</a>.<br><br>If you are in need of any assistance, please contact a Discord administrator. We look forward to another year at Vincent Massey!`
          };

        mailgun.messages().send(msg, function (error, body) {
            console.log(body);
            if(error){
                return reject(error);
            }
            return resolve(undefined);
        });
    })
}
