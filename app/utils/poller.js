const Requests = require("../schema/Requests");
const messages = require("../messages.json");

module.exports.Poller = async (bot) => {
  let now = new Date().getTime();

  Requests.find({}, async (err, users) => {
    if (err) throw err;

    users.forEach(async (user) => {
      if (user.requestExpireDate - now <= 0 && !user.isJoined) {
        bot.users.fetch(user.discordId).then((usr) => usr.send(messages.utils.emoji.no + " " + messages.system.poller.expired));
        await Requests.findOneAndDelete({ discordId: user.discordId });
      } else if (!user.messageSent && user.isJoined) {
        await Requests.findOneAndUpdate({ discordId: user.discordId }, { messageSent: true });

        bot.users.fetch(user.discordId).then((usr) => usr.send(messages.utils_emoji_ok + " " + messages.system.poller.verified));
      }
    });
  });
  setTimeout(this.Poller, 1000);
};
