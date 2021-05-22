require("dotenv").config();

const discord = require("discord.js");
const bot = new discord.Client();
const mongoose = require("mongoose");
const fs = require("fs");
const Twitter = require("twit");
const messages = require("./messages.json");
const Requests = require("./schema/Requests");
const prefix = "@";

const TwitHook = new discord.WebhookClient(process.env.HOOK_ID, process.env.HOOK_TOKEN);
const TwitClient = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

require("./utils/twit")(TwitClient, TwitHook);

const connectionString = `${process.env.MONGO_URL}/sessions`;
const connectionSettings = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
};

mongoose.connect(connectionString, connectionSettings, (err) => {
  if (err) throw err;
  console.log(messages.system.database.connected);
});

async function poller() {
  let now = new Date().getTime();

  Requests.find({}, async (err, users) => {
    if (err) throw err;

    users.forEach(async (user) => {
      if (user.requestExpireDate - now <= 0 && !user.isJoined) {
        await Requests.findOneAndDelete({ discordId: user.discordId });

        bot.users.fetch(user.discordId).then((usr) =>
          usr.send(messages.utils.emoji.no + " " + messages.system.poller.expired).catch(() => {
            bot.guilds.cache
              .get(process.env.GUILD_ID)
              .channels.cache.get("750798584282349749")
              .send(messages.utils.emoji.no + " " + messages.system.poller.expired);
          })
        );
      } else if (!user.messageSent && user.isJoined) {
        await Requests.findOneAndUpdate({ discordId: user.discordId }, { messageSent: true });

        bot.users.fetch(user.discordId).then((usr) =>
          usr.send(messages.utils_emoji_ok + " " + messages.system.poller.verified).catch(() => {
            bot.guilds.cache
              .get(process.env.GUILD_ID)
              .channels.cache.get("750798584282349749")
              .send(messages.utils_emoji_ok + " " + messages.system.poller.verified);
          })
        );
      }
    });
  });

  setTimeout(poller, 1000);
}

bot.once("ready", () => {
  //* FETCHING COMMANDS
  console.clear();
  console.log(messages.system.commands.fetching);

  bot.commands = new discord.Collection();

  fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);
    let jsfile = files.filter((f) => f.split(".").pop() === "js");
    if (jsfile.length <= 0) {
      console.log(messages.system.commands.nothing);
      return;
    }
    jsfile.forEach((f, i) => {
      let props = require(`./commands/${f}`);
      console.log(`${f} loaded!`);
      bot.commands.set(props.help.name, props);
    });
  });

  //* INITIALIZATION COMPLETED
  let date = new Date();
  let dateString = `${date.getDate()}-${Number(
    date.getMonth() + 1
  )}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

  console.clear();
  console.log(`[${dateString}] ${messages.system.startup.completed}`);

  setTimeout(poller, 5000);
});

bot.on("message", (msg) => {
  if (msg.author.bot) return;
  if (msg.channel.type != "text") return;

  let args = msg.content.replace(/\s+/g, " ").toLowerCase().split(" ");

  if (args[0].startsWith(prefix)) {
    let exists = bot.commands.has(args[0].replace(`${prefix}`, ""));
    if (exists) bot.commands.get(args[0].replace(`${prefix}`, "")).run(bot, msg, args);
  }
});

bot.login(process.env.BOT_TOKEN);
