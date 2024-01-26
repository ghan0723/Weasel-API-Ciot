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

export interface KeywordCounts {
  [key: string]: number;
}

export interface MergedData {
  pcname: string;
  keywordCounts: KeywordCounts;
  total?: number; // total 속성을 추가합니다.
}