/* eslint-disable no-console */
require("dotenv").config();

const TOKEN = process.env.TELEGRAM_TOKEN;
const url = process.env.URL;
const port = process.env.PORT || 3000;

const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(TOKEN);

// This informs the Telegram servers of the new webhook.
bot.setWebHook(`${url}/bot/${TOKEN}`);

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Basic configurations
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// parse the updates to JSON
app.use(express.json());
// set cors
app.use(cors());

// Matches /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await bot.sendMessage(
    chatId,
    `\n\nHello, ${msg.chat.first_name}👋,\n\n🌟 Welcome to Feed the Fennec! 🌟\n\nMatch tasty treats, fill the fennec's belly, collect coins! Just one level, tons of fun. Invite friends, earn more coins together! Ready to feed the fennec?\n\nLet's match! 🦊💰`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Play game", web_app: { url } }]],
      },
    },
  );
});

// Render the HTML game
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Send token to client (main js file)
app.get("/api", (req, res) => {
  // send token only if the client is tg
  res.send({
    api: process.env.API_URL,
  });
});

// We are receiving updates at the route below!
app.post(`/bot/${TOKEN}`, (req, res) => {
  const { body } = req;
  bot.processUpdate(body);
  res.sendStatus(200);
});

// Bind server to port
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
