import { Prisma } from "@prisma/client";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { siteConfig } from "@config/site";
import { PunishmentListItem } from "@/types";

import { db } from "../db";
import { Dictionary } from "../language/types";
import {getBanCount} from "@/lib/punishment/ban";
import {getMuteCount} from "@/lib/punishment/mute";
import {getWarnCount} from "@/lib/punishment/warn";
import {getKickCount} from "@/lib/punishment/kick";

const getPunishmentCountUncached = async (player: string | null, staff: string | null) => {
  const [bans, mutes, warns, kicks] = await Promise.all([
    getBanCount(player ?? undefined, staff ?? undefined),
    getMuteCount(player ?? undefined, staff ?? undefined),
    getWarnCount(player ?? undefined, staff ?? undefined),
    getKickCount(player ?? undefined, staff ?? undefined),
  ]);
  return { bans, mutes, warns, kicks };
};

const getPunishmentCountCached = unstable_cache(
  getPunishmentCountUncached,
  ["punishment-count"],
  { revalidate: 900 }
);

const getPunishmentCount = cache(
  async (player?: string, staff?: string) =>
    getPunishmentCountCached(player ?? null, staff ?? null)
);

const getPlayerName = async (uuid: string) => {
  const player = await db.history.findFirst({
    where: {
      uuid
    },
    orderBy: {
      date: 'desc'
    },
    select: {
      name: true
    }
  });

  return player?.name;
}

const getPlayerNamesBatch = async (uuids: string[]): Promise<Map<string, string | undefined>> => {
  const uniqueUuids = Array.from(new Set(uuids.filter((u): u is string => !!u)));
  if (uniqueUuids.length === 0) return new Map();

  const players = await db.history.findMany({
    where: { uuid: { in: uniqueUuids } },
    orderBy: { date: 'desc' },
    select: { uuid: true, name: true }
  });

  const nameMap = new Map<string, string | undefined>();
  for (const player of players) {
    if (player.uuid && !nameMap.has(player.uuid)) {
      nameMap.set(player.uuid, player.name ?? undefined);
    }
  }
  return nameMap;
}

const getPunishments = async (page: number, player?: string, staff?: string) => {
    const pageSize = 10;
    const offset = (page - 1) * pageSize;
    const subqueryLimit = offset + pageSize;

    const prefix = process.env.DB_PREFIX || 'litebans_';
    const tableBans = Prisma.raw(prefix + 'bans');
    const tableMutes = Prisma.raw(prefix + 'mutes');
    const tableWarnings = Prisma.raw(prefix + 'warnings');
    const tableKicks = Prisma.raw(prefix + 'kicks');

    const query = Prisma.sql`
    SELECT * FROM (
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'ban' AS type
        FROM ${tableBans}
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) bans
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'mute' AS type
        FROM ${tableMutes}
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) mutes
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'warn' AS type
        FROM ${tableWarnings}
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) warns
      UNION ALL
      SELECT * FROM (
        SELECT id, uuid, banned_by_name, banned_by_uuid, reason, time, until, active, 'kick' AS type
        FROM ${tableKicks}
        WHERE 1=1
          ${player ? Prisma.sql`AND uuid = ${player}` : Prisma.sql``}
          ${staff ? Prisma.sql`AND banned_by_uuid = ${staff}` : Prisma.sql``}
        ORDER BY time DESC
          LIMIT ${subqueryLimit}
      ) kicks
      ORDER BY time DESC
        LIMIT ${pageSize}
      OFFSET ${offset}
    ) final_result
  `;

    return await db.$queryRaw(query) as PunishmentListItem[];
}

const sanitizePunishments = async (dictionary: Dictionary, punishments: PunishmentListItem[]) => {
  const uuids = punishments.map(p => p.uuid).filter((u): u is string => !!u);
  const nameMap = await getPlayerNamesBatch(uuids);

  const sanitized = punishments.map((punishment) => {
    const name = nameMap.get(punishment.uuid!);
    const active = typeof punishment.active === "boolean" ? punishment.active : punishment.active === "1";
    const until = (punishment.type == "ban" || punishment.type == "mute") ? 
                    punishment.until.toString() === "0" ? 
                    dictionary.table.permanent : 
                    new Date(parseInt(punishment.until.toString())) : 
                  "";
    const status = (punishment.type == "ban" || punishment.type == "mute") ?
                    until == dictionary.table.permanent ? 
                    active : 
                    (until < new Date() ? false : (active ? undefined : false)) :
                  undefined;
    return {
      ...punishment,
      id: punishment.id.toString(),
      time: new Date(parseInt(punishment.time.toString())),
      console: punishment.banned_by_uuid === siteConfig.console.uuid,
      status,
      until,
      name
    }
  });

  return sanitized;
}

export { getPunishmentCount, getPlayerName, getPlayerNamesBatch, getPunishments, sanitizePunishments }