import connection from "../db/db";
import { IpRange, ResultItem } from "../interface/interface";

interface ResultWithCountsItem {
  pcname: string;
  keywordCounts: Record<string, number>;
}

class KeywordService {
  getKeyword(
    props: any,
    select: any,
    ipRanges: IpRange[]
  ): Promise<ResultWithCountsItem[]> {
    let table: string;
    let dayOption: string;

    if (props === "network") {
      table = "detectfiles";
    } else if (props === "media") {
      table = "detectmediafiles";
    } else if (props === "outlook") {
      table = "outlookpstviewer";
    } else {
      table = "detectprinteddocuments";
    }

    if (select === "day") {
      dayOption = "DATE(time) = CURDATE()";
    } else if (select === "week") {
      dayOption = "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
    } else {
      dayOption = "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
    }

    // IP 범위 조건들을 생성
    const ipConditions = ipRanges
      .map(
        (range) =>
          `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
      )
      .join(" OR ");
    const query = `select pcname, keywords from ${table} where (${dayOption}) AND (${ipConditions}) AND 
    (
      keywords LIKE '%주민번호%' OR
      keywords LIKE '%핸드폰번호%' OR
      keywords LIKE '%이력서%'
    ) `;

    return new Promise<ResultWithCountsItem[]>((resolve, reject) => {
      connection.query(query, (error: any, result: any[]) => {
        if (error) {
          reject(error);
        } else {
          const pcnames = Array.from(
            new Set(result.map((item: any) => item.pcname))
          );
          const resultWithCounts: ResultWithCountsItem[] = pcnames.map(
            (pcname: string) => {
              const pcResults = result.filter(
                (item: any) => item.pcname === pcname
              );
              // Create an object to store keyword counts for the current pcname
              const keywordCountMap: Record<string, number> = {};

              pcResults.forEach((item: ResultItem) => {
                // Extract counts and keywords using regex
                const matches = item.keywords.match(
                  /([^\s,()]+)(?:\s*,\s*|\s*\(\s*(\d+)\s*\)\s*)?/g
                );

                if (matches) {
                  matches.forEach((match) => {
                    const [keyword, count] = match.split(/\s*\(\s*|\s*\)\s*/);
                    const numericCount = parseInt(count, 10) || 1;
                    // Add the count to the existing count for the keyword
                    keywordCountMap[keyword] =
                      (keywordCountMap[keyword] || 0) + numericCount;
                  });
                }
              });
              // Return an object with pcname and keyword counts
              return {
                pcname: pcname,
                keywordCounts: keywordCountMap,
              };
            }
          );
          // Merge results for duplicate pcnames
          const mergedResult: ResultWithCountsItem[] = [];
          resultWithCounts.forEach((item) => {
            const existingIndex = mergedResult.findIndex(
              (mergedItem) => mergedItem.pcname === item.pcname
            );
            if (existingIndex !== -1) {
              // Merge keyword counts for duplicate pcnames
              Object.entries(item.keywordCounts).forEach(([keyword, count]) => {
                mergedResult[existingIndex].keywordCounts[keyword] =
                  (mergedResult[existingIndex].keywordCounts[keyword] || 0) +
                  count;
              });
            } else {
              // Add unique pcname to the merged result
              mergedResult.push(item);
            }
          });
          resolve(mergedResult);
        }
      });
    });
  }
}

export default KeywordService;
