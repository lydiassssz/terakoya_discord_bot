const { Client, GatewayIntentBits } = require("discord.js");

require("dotenv").config({ path: ".env" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: ["MESSAGE", "REACTION"], // 未キャッシュのメッセージも処理可能にする
});

client.once("ready", () => {
  console.log("Bot start!");
});

// 対象のチャンネルIDを指定
const announcementChannelIds = ["1309759525603115138", "1311212421913776189"];

// メッセージが送信されたときの処理
client.on("messageCreate", async (message) => {
  // Botのメッセージにはリアクションしない
  if (message.author.bot) return;

  // 対象のチャンネルでメッセージが送信された場合
  if (announcementChannelIds.includes(message.channel.id)) {
    try {
      await message.react("🎉");
    } catch (error) {
      console.error("リアクション追加エラー:", error);
    }
  }
});

// リアクションが追加されたときの処理
client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return; // Botのリアクションを無視

  const channelId = reaction.message.channel.id;
  if (announcementChannelIds.includes(channelId)) {
    try {
      const emojiName = reaction.emoji.name;
      const channel = reaction.message.channel;

      // リアクションが追加されたことを呟く
      await channel.send(
        `「${user.username}」がリアクション「${emojiName}」をつけました！`
      );
    } catch (error) {
      console.error("リアクション追加処理エラー:", error);
    }
  }
});

// リアクションが削除されたときの処理
client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return; // Botのリアクションを無視

  const channelId = reaction.message.channel.id;
  if (announcementChannelIds.includes(channelId)) {
    try {
      const emojiName = reaction.emoji.name;
      const channel = reaction.message.channel;

      // リアクションが削除されたことを呟く
      await channel.send(
        `「${user.username}」がリアクション「${emojiName}」を外しました！`
      );
    } catch (error) {
      console.error("リアクション削除処理エラー:", error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
