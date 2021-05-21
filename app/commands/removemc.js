const Requests = require("../schema/Requests");
const messages = require("../messages.json");

module.exports.run = async (bot, msg, args) => {
  let permissions = {
    channel_send_message: msg.guild.me.permissionsIn(msg.channel.id).has("SEND_MESSAGES") ? true : false,
    channel_add_reactions: msg.guild.me.permissionsIn(msg.channel.id).has("ADD_REACTIONS") ? true : false,
  };

  let request = await Requests.findOne({ discordId: msg.author.id });

  if (request) {
    if (permissions.channel_send_message)
      msg.channel.send(
        request.isJoined
          ? messages.utils.emoji.ok + " " + messages.commands.removemc.cortesy.session
          : messages.utils.emoji.ok + " " + messages.commands.removemc.cortesy.request
      );
    else if (permissions.channel_add_reactions) msg.react(messages.utils.emoji.ok);

    await Requests.findOneAndDelete({ discordId: msg.author.id });
  } else {
    if (permissions.channel_send_message) msg.channel.send(messages.utils.emoji.no + " " + messages.commands.removemc.cortesy.none);
    else if (permissions.channel_add_reactions) msg.react(messages.utils.emoji.no);
  }
};

module.exports.help = {
  name: "removemc",
  usage: messages.commands.removemc.help.usage,
  description: messages.commands.removemc.help.description,
};
