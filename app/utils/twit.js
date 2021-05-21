const Twitter = require("twit");

module.exports = (TwitClient, TwitHook) => {
  let stream = TwitClient.stream("statuses/filter", { follow: "64565898" });
  stream.on("tweet", async (tweet) => {
    if (tweet.in_reply_to_user_id_str == null && tweet.user.id_str == "64565898") {
      TwitHook.send(`https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`);
    }
  });
};
