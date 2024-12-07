const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // シーダーデータの準備
  const monitoredChannelsData = [
    { channelId: '1314854642517278740', channelName: 'bottest3' },
    { channelId: '1311212421913776189', channelName: 'bottest2' },
  ];

  const discordUsersData = [
    { userId: '430715652790026241', userName: 'lydiassssz' },
    { userId: '466249041848696834', userName: 'sige_8533' },
  ];

  // データ挿入

  // MonitoredChannel に複数データを挿入
  await prisma.monitoredChannel.createMany({
    data: monitoredChannelsData,
  });
  console.log('Inserted MonitoredChannels:', monitoredChannelsData);

  // DiscordUser に複数データを挿入
  await prisma.discordUser.createMany({
    data: discordUsersData,
  });
  console.log('Inserted DiscordUsers:', discordUsersData);

  // 確認のため、挿入されたデータを取得
  const allMonitoredChannels = await prisma.monitoredChannel.findMany();
  console.log('All MonitoredChannels:', allMonitoredChannels);

  const allDiscordUsers = await prisma.discordUser.findMany();
  console.log('All DiscordUsers:', allDiscordUsers);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
