# OverLegend discord bot

###### Official discord bot that sends minecraft news on discord from twitter.<br />More functionalities will be implemented in the future.

![](https://overlegend.it/img/favicon.svg)

## Installation

`git clone https://github.com/OverLegend/overlegendmc-discordbot.git`

###### First of all, you need to have installed `node.js` and `npm` packet manager.<br />Then you need to cd into the main folder (not app) and run the command `npm install` to install all the dependencies.

<br />

###### Then you need to create a `.env` file with the folling structure:

```
botId=<BOT_ID>
botToken=<BOT_TOKEN>

GUILD_ID=<YOUR_PRIVATE_GUILD_ID>

API_KEY=<TWITTER_CONSUMER_KEY>
API_SECRET=<TWITTER_CONSUMER_SECRET>

ACCESS_TOKEN=<TWITTER_ACCESS_TOKEN>
ACCESS_TOKEN_SECRET=<TWITTER_ACCESS_TOKEN_SECRET>

MONGO_URL=<MONGODB_URL>

HOOK_ID=<DISCORD_CHANNEL_HOOK_ID>
HOOK_TOKEN=<DISCORD_CHANNEL_HOOK_TOKEN>
```

###### To start the bot, you need to cd into the `/app` folder and run `node app.js` (default port 5000).
