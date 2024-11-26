const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return; //BOTのメッセージには反応しない

  if (message.content === "bot test") {
    message.channel.send("Hello World!");
  }
});

require("dotenv").config({ path: ".env" });

client.on("ready", () => {
  console.log("bot is ready");
});

client.login(process.env.DISCORD_TOKEN);
