import { cache } from "react";
import { unstable_cache } from "next/cache";

import { siteConfig } from "@config/site";
import { PunishmentListItem } from "@/types";

import { db } from "../db";
import { getPlayerNamesBatch } from "./punishment";

const getKickCountCached = unstable_cache(
  async (player: string | null, staff: string | null) => {
    return db.kicks.count({
      where: {
        uuid: player ?? undefined,
        banned_by_uuid: staff ?? undefined
      }
    });
  },
  ["kick-count"],
  { revalidate: 900 }
);

const getKickCount = (player?: string, staff?: string) =>
  getKickCountCached(player ?? null, staff ?? null);

const getKicks = async (page: number, player?: string, staff?: string) => {
  const kicks =  await db.kicks.findMany({
    where: {
      uuid: player,
      banned_by_uuid: staff
    },
    take: 10,
    skip: (page - 1) * 10,
    select: {
      id: true,
      uuid: true,
      banned_by_name: true,
      banned_by_uuid: true,
      reason: true,
      time: true,
      until: true,
      active: true
    },
    orderBy: {
      time: "desc"
    }
  });

  return kicks;
}

const sanitizeKicks = async (kicks: PunishmentListItem[]) => {
  const uuids = kicks.map(k => k.uuid).filter((u): u is string => !!u);
  const nameMap = await getPlayerNamesBatch(uuids);

  const sanitized = kicks.map((kick) => {
    const name = nameMap.get(kick.uuid!);
    return {
      ...kick,
      id: kick.id.toString(),
      time: new Date(parseInt(kick.time.toString())),
      console: kick.banned_by_uuid === siteConfig.console.uuid,
      active: typeof kick.active === "boolean" ? kick.active : kick.active === "1",
      name
    }
  });

  return sanitized;
}

const getKick = async (id: number) => {
  const kick = await db.kicks.findUnique({
    where: {
      id
    },
    select: {
      id: true,
      uuid: true,
      banned_by_name: true,
      banned_by_uuid: true,
      reason: true,
      time: true,
      until: true,
      active: true,
      server_origin: true,
    }
  });

  if (!kick) {
    return null;
  }
  
  const sanitized = (await sanitizeKicks([kick]))[0];

  return {
    ...sanitized,
    server: kick.server_origin
  }
}

const getCachedKick = cache(
  async (id: number) => getKick(id)
);

export { getKickCount, getKicks, sanitizeKicks, getKick, getCachedKick }