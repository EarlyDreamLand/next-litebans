import { cache } from "react";
import { unstable_cache } from "next/cache";

import { siteConfig } from "@config/site";
import { PunishmentListItem } from "@/types";

import { db } from "../db";
import { getPlayerNamesBatch } from "./punishment";

const getWarnCountCached = unstable_cache(
  async (player: string | null, staff: string | null) => {
    return db.warnings.count({
      where: {
        uuid: player ?? undefined,
        banned_by_uuid: staff ?? undefined
      }
    });
  },
  ["warn-count"],
  { revalidate: 900 }
);

const getWarnCount = (player?: string, staff?: string) =>
  getWarnCountCached(player ?? null, staff ?? null);

const getWarns = async (page: number, player?: string, staff?: string) => {
  const warns =  await db.warnings.findMany({
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
      active: true,
      warned: true
    },
    orderBy: {
      time: "desc"
    }
  });

  return warns;
}

const sanitizeWarns = async (warns: (PunishmentListItem & { warned: boolean | string})[]) => {
  const uuids = warns.map(w => w.uuid).filter((u): u is string => !!u);
  const nameMap = await getPlayerNamesBatch(uuids);

  const sanitized = warns.map((warn) => {
    const name = nameMap.get(warn.uuid!);
    return {
      ...warn,
      id: warn.id.toString(),
      time: new Date(parseInt(warn.time.toString())),
      console: warn.banned_by_uuid === siteConfig.console.uuid,
      active: typeof warn.active === "boolean" ? warn.active : warn.active === "1",
      warned: typeof warn.warned === "boolean" ? warn.warned : warn.warned === "1",
      name
    }
  });

  return sanitized;
}

const getWarn = async (id: number) => {
  const warn = await db.warnings.findUnique({
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
      warned: true
    }
  });

  if (!warn) {
    return null;
  }
  
  const sanitized = (await sanitizeWarns([warn]))[0];

  return {
    ...sanitized,
    server: warn.server_origin
  }
}

const getCachedWarn = cache(
  async (id: number) => getWarn(id)
);

export { getWarnCount, getWarns, sanitizeWarns, getWarn, getCachedWarn }