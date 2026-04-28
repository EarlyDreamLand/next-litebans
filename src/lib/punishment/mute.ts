import { cache } from "react";
import { unstable_cache } from "next/cache";

import { siteConfig } from "@config/site";
import { PunishmentListItem } from "@/types";

import { db } from "../db";
import { getPlayerNamesBatch } from "./punishment";
import { Dictionary } from "../language/types";

const getMuteCountCached = unstable_cache(
  async (player: string | null, staff: string | null) => {
    return db.mutes.count({
      where: {
        uuid: player ?? undefined,
        banned_by_uuid: staff ?? undefined
      }
    });
  },
  ["mute-count"],
  { revalidate: 900 }
);

const getMuteCount = (player?: string, staff?: string) =>
  getMuteCountCached(player ?? null, staff ?? null);

const getMutes = async (page: number, player?: string, staff?: string) => {
  const mutes =  await db.mutes.findMany({
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

  return mutes;
}

const sanitizeMutes = async (dictionary: Dictionary, mutes: PunishmentListItem[]) => {
  const uuids = mutes.map(m => m.uuid).filter((u): u is string => !!u);
  const nameMap = await getPlayerNamesBatch(uuids);

  const sanitized = mutes.map((mute) => {
    const name = nameMap.get(mute.uuid!);
    const until = mute.until.toString() === "0" ? dictionary.table.permanent : new Date(parseInt(mute.until.toString()));
    const active = typeof mute.active === "boolean" ? mute.active : mute.active === "1";
    return {
      ...mute,
      id: mute.id.toString(),
      time: new Date(parseInt(mute.time.toString())),
      status: until == dictionary.table.permanent ? 
                active : 
                (until < new Date() ? false : (active ? undefined : false)),
      console: mute.banned_by_uuid === siteConfig.console.uuid,
      permanent: until == dictionary.table.permanent,
      active,
      until,
      name
    }
  });

  return sanitized;
}

const getMute = async (id: number, dictionary: Dictionary) => {
  const mute = await db.mutes.findUnique({
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
      ipban: true,
      active: true,
      server_origin: true
    }
  });

  if (!mute) {
    return null;
  }
  
  const sanitized = (await sanitizeMutes(dictionary, [mute]))[0];

  return {
    ...sanitized,
    ipban: mute.ipban,
    server: mute.server_origin
  }
}

const getCachedMute = cache(
  async (id: number, dictionary: Dictionary) => getMute(id, dictionary)
);

export { getMuteCount, getMutes, sanitizeMutes, getMute, getCachedMute }