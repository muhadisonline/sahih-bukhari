// Generated (riyad). Do not edit.
export const SHARD_IDS = [0,1,2,3,4,5,6] as const;
export const shardLoaders: Record<number, () => Promise<{ default: Record<string, unknown> }>> = {
  0: () => import("./shards/0.json"),
  1: () => import("./shards/1.json"),
  2: () => import("./shards/2.json"),
  3: () => import("./shards/3.json"),
  4: () => import("./shards/4.json"),
  5: () => import("./shards/5.json"),
  6: () => import("./shards/6.json"),
};
export const kitabLoaders: Record<number, () => Promise<{ default: unknown }>> = {
  1: () => import("./kitab/1.json"),
  2: () => import("./kitab/2.json"),
  3: () => import("./kitab/3.json"),
  4: () => import("./kitab/4.json"),
  5: () => import("./kitab/5.json"),
  6: () => import("./kitab/6.json"),
  7: () => import("./kitab/7.json"),
  8: () => import("./kitab/8.json"),
  9: () => import("./kitab/9.json"),
  10: () => import("./kitab/10.json"),
  11: () => import("./kitab/11.json"),
  12: () => import("./kitab/12.json"),
  13: () => import("./kitab/13.json"),
  14: () => import("./kitab/14.json"),
  15: () => import("./kitab/15.json"),
  16: () => import("./kitab/16.json"),
  17: () => import("./kitab/17.json"),
  18: () => import("./kitab/18.json"),
  19: () => import("./kitab/19.json"),
  20: () => import("./kitab/20.json"),
};
