export interface IpRange {
  start: string;
  end: string;
}
export interface ResultItem {
  pcname: string;
  keywords: string;
}

export interface ResultWithCountsItem {
  pcname: string;
  keywords: Record<string, number>;
}