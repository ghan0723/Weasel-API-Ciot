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

    // Old_C
    if (props === "network") {
      table = "detectfiles";
    } else if (props === "media") {
      table = "detectmediafiles";
    } else if (props === "outlook") {
      table = "outlookpstviewer";
    } else {
      table = "detectprinteddocuments";
    }

    // New_C
    // if (props === "network") {
    //   table = "LeakedNetworkFiles";
    // } else if (props === "media") {
    //   table = "LeakedMediaFiles";
    // } else if (props === "outlook") {
    //   table = "LeakedOutlookFiles";
    // } else {
    //   table = "LeakedPrintingFiles";
    // }

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

      // Old_C
    const query = `select pcname, keywords from ${table} where (${dayOption}) AND (${ipConditions}) AND 
    (
      keywords LIKE '%주민번호%' OR
      keywords LIKE '%핸드폰번호%' OR
      keywords LIKE '%이력서%'
    ) `;

    // New_C
    // const query = `select pc_name, patterns from ${table} where (${dayOption}) AND (${ipConditions}) AND 
    // (
    //   patterns LIKE '%주민번호%' OR
    //   patterns LIKE '%핸드폰번호%' OR
    //   patterns LIKE '%이력서%'
    // ) `;

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

  getKeywordList():Promise<any> {
    return new Promise((resolve, reject) => {
      // Old_C
      const query = `select clnt_keyword_list from usersettings;`

      // New_C
      // const query = `select clnt_patterns_list from serversetting;`
      connection.query(query, (error, result) => {
        if(error) {
          reject(error);
        } else {
          // 패턴: = 문자로 시작하고 &&으로 끝나는 모든 항목을 찾음
          // ([^=]+)는 '=' 기호 전까지의 모든 문자를 키로 매칭하며, ([^&]+)는 '&' 기호 전까지의 모든 문자를 값으로 매칭합니다.
          // '&&'는 각 키-값 쌍의 끝을 나타냅니다.
          const regex = /([^=]+)=([^&]+)&&/g;
          let matches;
          const results = [];

          while ((matches = regex.exec(result[0]?.clnt_keyword_list)) !== null) {
            // matches[1]은 키, matches[2]는 값            
            results.push({
              key: matches[1],     // 키
              // value: matches[2] // 값
            });
          }

          const keysResult = results.map(data => data.key);
          resolve(keysResult);
        }

      });

    });
  }
}

export default KeywordService;
