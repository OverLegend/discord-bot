const Requests = require("../schema/Requests");
const messages = require("../messages.json");

module.exports.run = async (bot, msg, args) => {
  let permissions = {
    channel_send_message: msg.guild.me.permissionsIn(msg.channel.id).has("SEND_MESSAGES") ? true : false,
    channel_add_reactions: msg.guild.me.permissionsIn(msg.channel.id).has("ADD_REACTIONS") ? true : false,
  };

  let request = await Requests.findOne({ discordId: msg.author.id });

  if (request) {
    console.log(request);
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
