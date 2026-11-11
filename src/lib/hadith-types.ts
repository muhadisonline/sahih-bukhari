export type Front = { kind: string; text: string };

export type HadithPage = {
  no: number;
  ar: string;
  ki: number;
  k: string;
  b: string;
  t: string;
  f: Front[];
  bg: string;
  g: string;
  s: string;
  prev: number | null;
  next: number | null;
  seoTitle: string;
  seoDesc: string;
  path: string;
};

export type KitabBab = {
  title: string;
  first: number;
  last: number;
  nums: number[];
  items: { no: number; ar: string; title: string }[];
};

export type KitabPage = {
  i: number;
  title: string;
  short: string;
  first: number;
  last: number;
  count: number;
  babs: KitabBab[];
  seoTitle: string;
  seoDesc: string;
  path: string;
};

export type KitabIndexItem = {
  i: number;
  title: string;
  short: string;
  first: number;
  last: number;
  count: number;
};

export type SearchHit = {
  no: number;
  ar: string;
  k: string;
  b: string;
  snippet: string;
};
