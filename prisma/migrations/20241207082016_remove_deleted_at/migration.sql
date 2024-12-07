/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `DiscordUser` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `MonitoredChannel` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DiscordUser" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "MonitoredChannel" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "deletedAt",
ADD COLUMN     "deleted" BOOLEAN;

-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "deletedAt";
