const Requests = require("../schema/Requests");
const messages = require("../messages.json");

class Poller {
  constructor(bot) {
    this.bot = bot;
  }

  ping() {
    let now = new Date().getTime();

    Requests.find({}, async (err, users) => {
      if (err) throw err;

      users.forEach(async (user) => {
        if (user.requestExpireDate - now <= 0 && !user.isJoined) {
          this.bot.users.fetch(user.discordId).then((usr) => usr.send(messages.utils.emoji.no + " " + messages.system.poller.expired));
          await Requests.findOneAndDelete({ discordId: user.discordId });
        } else if (!user.messageSent && user.isJoined) {
          await Requests.findOneAndUpdate({ discordId: user.discordId }, { messageSent: true });

          this.bot.users.fetch(user.discordId).then((usr) => usr.send(messages.utils_emoji_ok + " " + messages.system.poller.verified));
        }
      });
    });

    setTimeout(this.ping, 1000);
  }
}

module.exports = {
  Poller,
};
