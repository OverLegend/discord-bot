require("dotenv").config();

const Twitter = require("twit");
const Discord = require("discord.js");
const mongoose = require("mongoose");

const bot = new Discord.Client();

bot.login(process.env.botToken);
require("./utils/mongoConnect")(mongoose);

const TwitterHook = new Discord.WebhookClient(process.env.HOOK_ID, process.env.HOOK_TOKEN);
const Requests = require("./utils/requestSchema");
const prefix = "-";

const TClient = new Twitter({
  consumer_key: process.env.API_KEY,
  consumer_secret: process.env.API_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

let stream = TClient.stream("statuses/filter", { follow: "64565898" });
stream.on("tweet", async (tweet) => {
  if (tweet.in_reply_to_user_id_str == null && tweet.user.id_str == "64565898") {
    TwitterHook.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
  }
});

bot.on("ready", () => {
  setTimeout(checkForAuthentification, 5000);
});


async function checkForAuthentification() {
  let now = new Date().getTime();

  Requests.find({}, async (err, users) => {
    if (err) throw err;

    users.forEach(async user => {
      if (user.requestExpireDate - now <= 0 && !user.isJoined) {
        bot.users.fetch(user.discordId).then(usr => usr.send(":x: La tua richiesta di autentificatione è scaduta."));
        await Requests.findOneAndDelete({ discordId: user.discordId });
      }
    });
  });
  setTimeout(checkForAuthentification, 1000);
}

bot.on("message", async (msg) => {
  if (msg.author.bot) return;

  const args = msg.content.split(/\s+/).join(' ').split(" ");
  let dateGen = new Date();

  /*
  if (msg.author.id == "347076094152802311") {
    msg.react('🤡');
  }*/


  if (args[0].toLowerCase() == `${prefix}addmc`) {
    // Check if he has provided a nickname
    if (args.length == 1 || args.length > 2) return msg.channel.send(`:x: Devi specificare il nickname del tuo account minecraft.`);

    let request = await Requests.findOne({ discordId: msg.author.id });

    // Check if the request has already been done
    if (request) {
      // Check if he has already joined the server
      if (request.isJoined) {
        msg.channel.send(":white_check_mark: Il tuo account è già autentificato.");
      } else {
        let msDifference = request.requestExpireDate - dateGen.getTime();
        let mDifference = Math.floor(msDifference / (1000 * 60));

        if (mDifference == 0)
          mDifference = Math.floor(msDifference / 1000) + " secondi";
        else
          mDifference += " minuti";

        if (request.nickname == args[1])
          msg.channel.send(`:x: Hai già effettuato la richiesta.\nEntra su \`mc.overlegend.it\` entro ${mDifference} per completare la procedura.`);
        else
          msg.channel.send(`:x: Hai già effettuato la richiesta tramite un'altro nickname.\nEntra su \`mc.overlegend.it\` entro ${mDifference} per completare la procedura.\nSe hai sbagliato nickname, utilizza \`-removemc\` e riesegui il comando.`);
      }
    } else {
      // Generate a date that is 10 minutes ahead now
      let targetDate = new Date(dateGen.getTime() + 10 * 60000).getTime();

      let newRequest = new Requests({
        discordId: msg.author.id,
        requestExpireDate: targetDate,
        nickname: args[1],
      });

      await newRequest.save();

      msg.channel.send(":white_check_mark: Hai effettuato la richiesta.\nEntra su \`mc.overlegend.it\` entro 10 minuti per completare la procedura.");
    }
  } else if (args[0].toLowerCase() == `${prefix}removemc`) {
    let request = await Requests.findOne({ discordId: msg.author.id });

    if (request) {
      if (request.isJoined)
        msg.channel.send(":white_check_mark: La tua sessione è stata rimossa.");
      else
        msg.channel.send(":white_check_mark: La tua richiesta è stata rimossa.");

      await Requests.findOneAndDelete({discordId: msg.author.id});
    } else {
      msg.channel.send(":x: Non hai ancora effettuato alcuna richiesta.\nPer farla, utilizza `-addmc <nickname>` e segui le istruzioni.");
    }
  } /*else if (args[0].toLocaleLowerCase() == `${prefix}infomc`) {
    let request = await Requests.findOne({ discordId: msg.author.id });

    let embed = new Discord.MessageEmbed();

    if (request) {

    } else {
      embed.setTitle("User informations");
      embed.setColor("#0abf2b");
      embed.setAuthor(msg.author.username + msg.author.tag, msg.author.avatar)
      msg.channel.send("");
    }
  }*/
});

