const { Client, GatewayIntentBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config({ path: ".env" });

const prisma = new PrismaClient();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once("ready", async () => {
  console.log("Bot start!");

  try {
    const guild = client.guilds.cache.first(); // サーバーを取得
    if (!guild) {
      console.error("サーバーが見つかりませんでした。");
      process.exit(1);
    }

    console.log(`取得中のサーバー: ${guild.name}`);

    // チャンネル情報を取得
    const channels = guild.channels.cache.filter(channel =>
      channel.isTextBased() && // テキストベースのチャンネルのみ
      channel.parent?.name !== "SERVER-LOG" // "SERVER-LOG"カテゴリーを除外
    );

    const dataToSeed = channels.map(channel => ({
      channelId: channel.id,
      channelName: channel.name,
    }));

    // Prismaでデータを保存
    for (const channelData of dataToSeed) {
      await prisma.monitoredChannel.upsert({
        where: { channelId: channelData.channelId },
        update: { channelName: channelData.channelName },
        create: { channelId: channelData.channelId, channelName: channelData.channelName },
      });
    }

    console.log(`シード完了: ${dataToSeed.length}件のチャンネルを保存しました。`);
  } catch (error) {
    console.error("チャンネル情報取得エラー:", error);
  } finally {
    await prisma.$disconnect();
    client.destroy();
    process.exit(0); // 正常終了
  }
});

client.login(process.env.DISCORD_TOKEN);
