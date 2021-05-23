const discord = require("discord.js");
const Requests = require("../schema/Requests");
const messages = require("../messages.json");

module.exports.run = async (bot, msg, args) => {
  let permissions = {
    channel_send_message: msg.guild.me.permissionsIn(msg.channel.id).has("SEND_MESSAGES") ? true : false,
    channel_add_reactions: msg.guild.me.permissionsIn(msg.channel.id).has("ADD_REACTIONS") ? true : false,
  };

  let request = await Requests.findOne({ discordId: msg.author.id });

  if (request) {
    let embedMessage = new discord.MessageEmbed();
    embedMessage.setColor("#0ec914");
    embedMessage.setAuthor(request.minecraft.nickname, `https://minepic.org/head/${request.minecraft.nickname}`);
    embedMessage.setTitle("Informazioni dell'account");

    embedMessage.addFields({ name: "UUID", value: request.minecraft.uuid });

    embedMessage.setTimestamp();
    embedMessage.setFooter("OverLegend", "https://www.overlegend.it/img/favicon.png");

    if (permissions.channel_send_message) msg.channel.send(embedMessage);
    else if (permissions.channel_add_reactions) msg.react(messages.utils.emoji.no);
  } else {
    if (permissions.channel_send_message) msg.channel.send(messages.utils.emoji.no + " " + messages.commands.infomc.cortesy.none);
    else if (permissions.channel_add_reactions) msg.react(messages.utils.emoji.no);
  }
};

module.exports.help = {
  name: "infomc",
  usage: messages.commands.infomc.help.usage,
  description: messages.commands.infomc.help.description,
};
