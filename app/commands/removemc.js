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
          ? messages.utils_emoji_ok + " " + messages.command_removemc_session
          : messages.utils_emoji_ok + " " + messages.command_removemc_request
      );
    else if (permissions.channel_add_reactions) msg.react(messages.utils_emoji_ok);

    await Requests.findOneAndDelete({ discordId: msg.author.id });
  } else {
    if (permissions.channel_send_message) msg.channel.send(messages.utils_emoji_no + " " + messages.command_removemc_none);
    else if (permissions.channel_add_reactions) msg.react(messages.utils_emoji_no);
  }
};

module.exports.help = {
  name: "removemc",
  usage: messages.command_removemc_usage,
  description: messages.command_removemc_description,
};
