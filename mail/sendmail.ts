require('dotenv').config();
import axios from 'axios';
import qs from 'qs';
export default async function (email : string, token : string, name : string){
    let link = `${process.env.VERIFY_URL}${token}`;
    const msg = qs.stringify({
        to: email,
        from: process.env.FROM_EMAIL,
        subject: 'Vincent Massey Discord Club Verification',
        text: `Hello ${name}!\n\nThank you for joining a club here at Vincent Massey Secondary School on Discord.\n\nIn order to maintain member privacy and security, we are requiring all users to verify themselves with their student email. To complete your account verification, please visit ${link} .\n\nIf you are in need of any assistance, or have any additional questions, please contact a Discord administrator. We look forward to another year at Vincent Massey!\n\nNote: This bot will only collect your school ID, full name, and Discord ID. No other personal data will be collected, and upon the end of the school year, all data collected will be destroyed.\n\nPowered by VMCS Club: https://vmcs.club`,
        html: `Hello ${name}!<br><br>Thank you for joining a club here at Vincent Massey Secondary School on Discord.<br><br>In order to maintain member privacy and security, we are requiring all users to verify themselves with their student email. To complete your account verification, please <a href="${link}">click here</a>.<br><br>If you are in need of any assistance, or have any additional questions, please contact a Discord administrator. We look forward to another year at Vincent Massey!<br><br>Note: This bot will only collect your school ID, full name, and Discord ID. No other personal data will be collected, and upon the end of the school year, all data collected will be destroyed.<br><br>Powered by <a href="https://vmcs.club">VMCS Club</a>`
    });

    await axios({
        method: 'post',
        url: `https://api.mailgun.net/v3/${process.env.DOMAIN}/messages`,
        data: msg,
        auth: {
            username: "api",
            password: process.env.MAILGUN_APIKEY
        },
        headers:{
            'Content-Type':'application/x-www-form-urlencoded'
        }
    })
}
