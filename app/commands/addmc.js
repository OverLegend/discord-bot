const Requests = require("../schema/Requests");
const messages = require("../messages.json");

module.exports.run = async (bot, msg, args) => {
  let permissions = {
    channel_send_message: msg.guild.me.permissionsIn(msg.channel.id).has("SEND_MESSAGES") ? true : false,
    channel_add_reactions: msg.guild.me.permissionsIn(msg.channel.id).has("ADD_REACTIONS") ? true : false,
  };

  let dateGen = new Date();

  let request = await Requests.findOne({ discordId: msg.author.id });

  if (request) {
    if (request.isJoined) {
      if (permissions.channel_send_message) msg.channel.send(messages.command_addmc_already);
      else if (permissions.channel_add_reactions) msg.react(messages.utils_emoji_ok);
    } else {
      let msDifference = request.requestExpireDate - dateGen.getTime();
      let mDifference = Math.floor(msDifference / (1000 * 60));

      if (mDifference == 0) mDifference = Math.floor(msDifference / 1000) + " " + messages.utils_time_seconds;
      else mDifference += " " + messages.utils_time_minutes;

      if (request.nickname == args[1])
        msg.channel.send(
          `:x: Hai già effettuato la richiesta.\nEntra su \`mc.overlegend.it\` entro ${mDifference} per completare la procedura.`
        );
      else
        msg.channel.send(
          `:x: Hai già effettuato la richiesta tramite un'altro nickname.\nEntra su \`mc.overlegend.it\` entro ${mDifference} per completare la procedura.\nSe hai sbagliato nickname, utilizza \`-removemc\` e riesegui il comando.`
        );
    }
  } else {
    if (args.length == 1 || args.length > 2) return msg.channel.send(messages.no + " " + messages.command_addmc_nonick);

    // Generate a date that is 10 minutes ahead now
    let targetDate = new Date(dateGen.getTime() + 10 * 60000).getTime();

    let newRequest = new Requests({
      discordId: msg.author.id,
      requestExpireDate: targetDate,
      nickname: args[1],
    });

    await newRequest.save();

    msg.channel.send(messages.ok + " " + messages.command_addmc_new);
  }
};

module.exports.help = {
  name: "addmc",
  usage: messages.command_addmc_usage,
  description: messages.command_addmc_description,
};
