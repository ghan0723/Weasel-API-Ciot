// import connection from "../db/db";
// import {
//   IpRange,
//   ResultItem,
//   ResultWithCountsItem,
// } from "../interface/interface";

// class KeywordService {
//   getKeyword(props: any, select: any, ipRanges: IpRange[]): Promise<any> {
//     let table: string;
//     let dayOption: string;

//     if (props === "network") {
//       table = "detectfiles";
//     } else if (props === "media") {
//       table = "detectmediafiles";
//     } else if (props === "outlook") {
//       table = "outlookpstviewer";
//     } else {
//       table = "detectprinteddocuments";
//     }

//     if (select === "day") {
//       dayOption = "DATE(time) = CURDATE()";
//     } else if (select === "week") {
//       dayOption = "time >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND time <= NOW()";
//     } else {
//       dayOption = "time >= DATE_SUB(NOW(), INTERVAL 1 MONTH) AND time <= NOW()";
//     }

//     // IP 범위 조건들을 생성
//     const ipConditions = ipRanges
//       .map(
//         (range) =>
//           `(INET_ATON(agent_ip) BETWEEN INET_ATON('${range.start}') AND INET_ATON('${range.end}'))`
//       )
//       .join(" OR ");
//     const query = `select pcname, keywords from ${table} where (${dayOption}) AND (${ipConditions}) AND
//     (
//       keywords LIKE '%주민번호%' OR
//       keywords LIKE '%핸드폰번호%' OR
//       keywords LIKE '%이력서%'
//     ) `;
//     return new Promise((resolve, reject) => {
//       const aggregatedResults: Record<string, Record<string, number>> = {};
//       connection.query(query, (error, result) => {
//         if (error) {
//           reject(error);
//         } else {
//           console.log("result : ", result);
//           const pcnames = Array.from(
//             new Set(result.map((item: any) => item.pcname))
//           );
//         //   const resultWithCounts: ResultWithCountsItem[] = result.map(
//         //     (item: ResultItem) => {
//         //       // 정규식을 사용하여 괄호 안의 숫자를 추출
//         //       const counts = item.keywords.match(/\((\d+)\)/g);

//         //       // 키워드 이름을 추출
//         //       const keywords = item.keywords.match(/[^()]+(?=\()/g);

//         //       // 키워드와 카운트를 매핑한 객체 생성
//         //       const keywordCountMap: Record<string, number> = {};
//         //       if (keywords && counts) {
//         //         keywords.forEach((keyword: any, index: any) => {
//         //           keywordCountMap[keyword] = parseInt(
//         //             counts[index].match(/\d+/)![0],
//         //             10
//         //           );
//         //         });
//         //       }
//         //       console.log("keywordCountMap : ", keywordCountMap);

//         //       return ({
//         //         pcname:item.pcname,
//         //         keywords:keywordCountMap
//         //       });
//         //     }
//         //   );
//         //   console.log("resultWithCounts : ", resultWithCounts);
//         }
//       });
//     });
//   }
// }
// export default KeywordService;
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
                const counts = item.keywords.match(/\((\d+)\)/g);
                const keywords = item.keywords.match(/[^()]+(?=\()/g);

                if (keywords && counts) {
                  keywords.forEach((keyword: any, index: any) => {
                    const count = parseInt(counts[index].match(/\d+/)![0], 10);
                    // Add the count to the existing count for the keyword
                    keywordCountMap[keyword] =
                      (keywordCountMap[keyword] || 0) + count;
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

        //   // Calculate sums of keywordCounts values and sort by sum in descending order
        //   const sortedResult = mergedResult.sort((a, b) => {
        //     const sumA = Object.values(a.keywordCounts).reduce(
        //       (acc, value) => acc + value,
        //       0
        //     );
        //     const sumB = Object.values(b.keywordCounts).reduce(
        //       (acc, value) => acc + value,
        //       0
        //     );
        //     return sumB - sumA; // Sort in descending order
        //   });
        //   const top5Result = sortedResult.slice(0, 5);
        //   console.log('top5Result :', top5Result);
          resolve(mergedResult);
        }
      });
    });
  }
}

export default KeywordService;
