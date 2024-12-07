const { Client, GatewayIntentBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient();

const LOG_CHANNEL_ID = "1314853401548427274"; // ログ出力先のチャンネルIDを指定

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: ["USER", "MESSAGE", "REACTION"], // 未キャッシュのメッセージも処理可能にする
});

let announcementChannelIds = []; // 動的に取得するチャンネルIDを格納

// ログメッセージ送信関数
async function sendLogMessage(content) {
  try {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
    if (logChannel && logChannel.isTextBased()) {
      await logChannel.send(content);
    } else {
      console.error("ログチャンネルが見つからないか、テキストチャンネルではありません。");
    }
  } catch (error) {
    console.error("ログメッセージ送信中にエラーが発生しました:", error);
  }
}

// DiscordUserを登録または取得
async function getOrCreateUser(user) {
  let dbUser = await prisma.discordUser.findUnique({
    where: { userId: user.id },
  });

  if (!dbUser) {
    dbUser = await prisma.discordUser.create({
      data: { userId: user.id, userName: user.username },
    });
  }

  return dbUser;
}

// Bot起動時の設定
client.once("ready", async () => {
  console.log("Bot start!");

  // Prismaクエリを使ってチャンネルIDの一覧を取得
  try {
    const monitoredChannels = await prisma.monitoredChannel.findMany();
    announcementChannelIds = monitoredChannels.map((channel) => channel.channelId);
    console.log("Monitored Channels:", announcementChannelIds);
  } catch (error) {
    console.error("Failed to fetch monitored channels:", error);
  }
});

// メッセージが送信されたときの処理
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // Botのメッセージには反応しない

  if (announcementChannelIds.includes(message.channel.id)) {
    try {
      const content = message.content.length > 0
        ? message.content.slice(0, 10)
        : "file"; // ファイルや写真のみの投稿の場合

      const dbUser = await getOrCreateUser(message.author);

      // Postテーブルに登録
      await prisma.post.create({
        data: {
          userId: dbUser.id,
          messageId: message.id,
          content,
        },
      });

      // ログメッセージを送信
      await sendLogMessage(
        `「${dbUser.userName}」がチャンネル「${message.channel.name}」に投稿しました: ${content}`
      );
    } catch (error) {
      console.error("メッセージ保存エラー:", error);
    }
  }
});

// メッセージ削除時の監査ログ処理
client.on("messageDelete", async (message) => {
  if (!announcementChannelIds.includes(message.channel.id)) return;

  try {
    // Postテーブルの該当メッセージを削除フラグ更新
    await prisma.post.updateMany({
      where: { messageId: message.id },
      data: { deleted: true },
    });

    // ログメッセージを送信
    await sendLogMessage(
      `「${message.author.username}」のメッセージがチャンネル「${message.channel.name}」で削除されました。`
    );
  } catch (error) {
    console.error("メッセージ削除処理エラー:", error);
  }
});

// リアクションが追加されたときの処理
client.on("messageReactionAdd", async (reaction, user) => {
  if (reaction.partial) {
    try {
      await reaction.fetch(); // 未キャッシュデータをフェッチ
    } catch (error) {
      console.error("リアクションのフェッチ中にエラーが発生しました:", error);
      return;
    }
  }

  if (user.bot) return; // Botのリアクションを無視

  const channelId = reaction.message.channel.id;
  if (announcementChannelIds.includes(channelId)) {
    try {
      const emojiName = reaction.emoji.name;

      const dbUser = await getOrCreateUser(user);

      // DiscordのmessageIdに対応するPostのidを取得
      const post = await prisma.post.findUnique({
        where: { messageId: reaction.message.id },
      });

      if (!post) {
        console.error(`対応するPostが見つかりません: messageId=${reaction.message.id}`);
        return; // Postが見つからない場合は終了
      }

      // Reactionが存在するかチェック
      const existingReaction = await prisma.reaction.findFirst({
        where: {
          userId: dbUser.id,
          messageId: post.id, // Postの整数型のidを使用
          reaction: emojiName,
        },
      });

      if (!existingReaction) {
        // Reactionテーブルに登録
        await prisma.reaction.create({
          data: {
            userId: dbUser.id,
            messageId: post.id, // Postの整数型のidを使用
            reaction: emojiName,
          },
        });

        // ログメッセージを送信
        await sendLogMessage(
          `「${dbUser.userName}」がリアクション「${emojiName}」をチャンネル「${reaction.message.channel.name}」でつけました！`
        );
      }
    } catch (error) {
      console.error("リアクション追加処理エラー:", error);
    }
  }
});


client.login(process.env.DISCORD_TOKEN);
