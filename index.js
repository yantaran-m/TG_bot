const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TG_BOT_TOKEN || 'no';
const PASSWORD = process.env.TG_BOT_RECEIVER_PASSWORD || "SOME_MY_PASSWORD"; // Задайте свой пароль

const bot = new TelegramBot(TOKEN, { polling: true });
const authorizedUsers = new Set();

bot.onText(/\/pw (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const inputPassword = match[1];

    if (inputPassword === PASSWORD) {
        authorizedUsers.add(chatId);
        bot.sendMessage(chatId, 'AUTHORIZED!');
    } else {
        bot.sendMessage(chatId, 'Wrong password');
    }
});

bot.onText(/\/check/, (msg, match) => {
    const chatId = msg.chat.id;

    if(!authorizedUsers.has(chatId)) {
        console.log("not authorized: ", chatId);
        return;
    }

    authorizedUsers.forEach(chatId => {
        bot.sendMessage(chatId, "Working...");
    });
});

function sendMsg(name, contactMethod, contact, message) {
    authorizedUsers.forEach(chatId => {
        bot.sendMessage(chatId, `***NEW MESSAGE***\n\nName:    ${name}\nContact: ${contactMethod} ${contact}\n\n${message}`);
    });
}

app.use(express.json());

app.post('/message', (req, res) => {
    const data = req.body;

    const name = data.name;
    const meth = data.contactMethod;
    const contact = data.contact;
    const message = data.message;

    const ok = name && meth && contact && message;
    if(!ok) {
        res.statusCode = 400;
        res.json({status: "error", message: "bad fields"});
        return;
    }
    
    try {
        sendMsg(name, meth, contact, message);
    } catch (error) {
        res.statusCode = 500;
        res.json({status: "error", message: "MESSAGE SEND ERROR"});
        return;
    }



    // Ответ с подтверждением
    res.json({ status: 'ok' });
});

app.get("/check", (req, res) => {
    res.json({status: "ok"});
});

app.listen(PORT, () => {
    console.log(`Server has been started on http://localhost:${PORT}`);
});
