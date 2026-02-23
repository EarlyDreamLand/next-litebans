import { db } from "../db";

const getPlayerByName = async (name: string) => {
  const player = await db.history.findFirst({
    where: {
      name
    },
    orderBy: {
      date: 'desc'
    },
    select: {
      uuid: true,
      name: true
    }
  });

  return player;
}

const getPlayerBanCount = async (uuid: string) => {
  const count = await db.bans.count({
    where: {
      uuid
    }
  });

  return count;
}

const getPlayerMuteCount = async (uuid: string) => {
  const count = await db.mutes.count({
    where: {
      uuid
    }
  });

  return count;
}

const getPlayerWarnCount = async (uuid: string) => {
  const count = await db.warnings.count({
    where: {
      uuid
    }
  });

  return count;
}

const getPlayerKickCount = async (uuid: string) => {
  const count = await db.kicks.count({
    where: {
      uuid
    }
  });

  return count;
}

export { getPlayerByName, getPlayerBanCount, getPlayerMuteCount, getPlayerWarnCount, getPlayerKickCount}