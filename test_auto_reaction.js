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

// メッセージが送信されたときの処理
client.on("messageCreate", async (message) => {
  const announcementChannelId = "1309759525603115138"; // チャンネルIDを指定

  // Botのメッセージにはリアクションしない
  if (message.author.bot) return;

  // 指定したIDのチャンネルメッセージにリアクションを追加する
  if (message.channel.id === announcementChannelId) {
    try {
      await message.react("🎉");
    } catch (error) {
      console.error("エラー", error);
    }
  }
});

// リアクションが追加されたときの処理
client.on("messageReactionAdd", async (reaction, user) => {
  const announcementChannelId = "1309759525603115138";

  if (user.bot) return;

  if (reaction.message.channel.id === announcementChannelId) {
    const emojiName = reaction.emoji.name;

    // リアクションが追加されたことを指定のチャンネルに呟く
    const channel = reaction.message.channel;
    await channel.send(
      `「${user.username}」がリアクション「${emojiName}」をつけました！`
    );
  }
});

// リアクションがなくなったときの処理
client.on("messageReactionRemove", async (reaction, user) => {
  const announcementChannelId = "1309759525603115138";

  if (user.bot) return;

  if (reaction.message.channel.id === announcementChannelId) {
    const emojiName = reaction.emoji.name;

    // リアクションが削除されたことを指定のチャンネルに呟く
    const channel = reaction.message.channel;
    await channel.send(
      `「${user.username}」がリアクション「${emojiName}」を外しました！`
    );
  }
});

client.login(process.env.DISCORD_TOKEN);
