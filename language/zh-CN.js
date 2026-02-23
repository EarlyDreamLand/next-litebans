const language = {
  info: {
    country_code: "CN",
    lang_name: "简体中文"
  },
  site: {
    description: "初梦大陆服务器违规查询界面。一键查询玩家封禁、警告、踢出与禁言历史。规则清晰，执行透明，致力保障所有玩家的公平游戏体验。"
  },
  words: {
    bans: {
      singular: "封禁",
      plural: "封禁"
    },
    mutes: {
      singular: "禁言",
      plural: "禁言"
    },
    kicks: {
      singular: "踢出",
      plural: "踢出"
    },
    warns: {
      singular: "警告",
      plural: "警告"
    },
    yes: "是",
    no: "否",
    player: "玩家",
    staff: "管理",
    reason: "原因",
    date: "日期",
    expires: "失效时间",
    originServer: "来源服务器",
    notified: "通知",
  },
  pages: {
    home: {
      title: "首页",
      // Placeholders: {total}, {bans}, {mutes}, {kicks}, {warns}
      subtitle: "一键查询玩家封禁、警告、踢出与禁言历史。规则清晰，执行透明，致力保障所有玩家的公平游戏体验。"
    },
    history: {
      title: "处罚历史",
      // Placeholders: {total}
      subtitle: "总处罚数: {total}",
      table: {
        heads: {
          type: "类型",
          player: "玩家",
          by: "处理",
          reason: "原因",
          date: "日期",
          expires: "失效时间"
        },
        permanent: "永久封禁",
        expire_not_applicable: "N/A",
        active: {
          true: "生效",
          temporal: "临时",
          false: "失效"
        }
      }
    },
    bans: {
      title: "封禁",
      // Placeholders: {total}
      subtitle: "封禁数量: {total}",
      table: {
        heads: {
          player: "玩家",
          by: "处理",
          reason: "原因",
          date: "日期",
          expires: "失效时间"
        },
        permanent: "永久封禁",
        active: {
          true: "生效",
          temporal: "临时",
          false: "失效"
        }
      },
      info: {
        title: "封禁 #{id}",
        badges: {
          ipban: "IP封禁",
          active: "生效",
          expired: "失效",
          permanent: "永久",
        }
      }
    },
    mutes: {
      title: "禁言",
      // Placeholders: {total}
      subtitle: "禁言数量: {total}",
      table: {
        heads: {
          player: "玩家",
          by: "处理",
          reason: "原因",
          date: "日期",
          expires: "失效时间"
        },
        permanent: "永久禁言",
        active: {
          true: "生效",
          temporal: "临时",
          false: "失效"
        }
      },
      info: {
        title: "禁言 #{id}",
        badges: {
          ipmute: "IP禁言",
          active: "生效",
          expired: "失效",
          permanent: "永久",
        }
      }
    },
    warns: {
      title: "警告",
      // Placeholders: {total}
      subtitle: "警告数量: {total}",
      table: {
        heads: {
          player: "玩家",
          by: "处理",
          reason: "原因",
          date: "日期",
          notified: "通知"
        },
      },
      info: {
        title: "警告 #{id}"
      }
    },
    kicks: {
      title: "踢出",
      // Placeholders: {total}
      subtitle: "踢出数量: {total}",
      table: {
        heads: {
          player: "玩家",
          by: "处理",
          reason: "原因",
          date: "日期"
        }
      },
      info: {
        title: "踢出 #{id}"
      }
    },
    playerHistory: {
      // Placeholders: {player}
      title: "{player}"
    },
    errors: {
      notFound: {
        title: "404",
        description: "你似乎迷路了。请返回主页。",
        button: "返回主页"
      }
    }
  },
  pagination: {
    previous: "上一页",
    next: "下一页"
  },
  notifications: {
    playerNotFound: {
      title: "错误",
      description: "数据库中不存在该玩家。",
    }
  }
}

module.exports = language;