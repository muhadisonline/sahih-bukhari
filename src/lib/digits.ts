const AR = "٠١٢٣٤٥٦٧٨٩";

export function arDigits(value: number | string) {
  return String(value).replace(/\d/g, (d) => AR[Number(d)]);
}

export function westernDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
}
