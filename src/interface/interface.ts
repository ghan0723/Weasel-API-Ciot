export interface IpRange {
  start: string;
  end: string;
}
export interface ResultItem {
  pc_name: string;
  patterns: string;
}

export interface ResultWithCountsItem {
  pc_name: string;
  patterns: Record<string, number>;
}

export interface KeywordCounts {
  [key: string]: number;
}

export interface MergedData {
  pc_name: string;
  keywordCounts: KeywordCounts;
  total?: number; // total 속성을 추가합니다.
}