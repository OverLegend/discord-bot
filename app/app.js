const Twitter = require("twit");
const Discord = require("discord.js");

require("dotenv").config();

const bot = new Discord.Client();
const TwitterHook = new Discord.WebhookClient(process.env.HOOK_ID, process.env.HOOK_TOKEN);

const TClient = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

let stream = TClient.stream("statuses/filter", {   follow: "64565898" });
stream.on("tweet", async (tweet) => {
  if (tweet.in_reply_to_user_id_str == null && tweet.user.id_str == "64565898") {
    TwitterHook.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
  }
});

bot.login(process.env.botToken);
