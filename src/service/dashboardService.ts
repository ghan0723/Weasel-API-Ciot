import connection from "../db/db";

class DashboardService {
  //자주 사용한 테스트 케이스 TOP 5 Widget
  getMostTC(): Promise<any> {
    return new Promise((resolve, reject) => {
      //자주 사용한 TC 명과 사용 횟수 조회 query
      const query = `select r_tc_name, count(*) as usage_count from sessionresult group by r_tc_name order by usage_count desc limit 5`;
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        }

        // Promise 배열 생성
        const promises = result.map(
          (row: { tc_group: any; r_tc_name: any; usage_count: any }) => {
            return new Promise<any>((resolve, reject) => {
              //각 s_id에 대한 p_name 조회 query
              const tcGroupQuery = `select tc_group from testcases where tc_name = ?`;
              connection.query(
                tcGroupQuery,
                [row.r_tc_name],
                (error, tcGroupResult) => {
                  if (error) {
                    return reject(error);
                  }
                  //p_name 결과를 사용하여 객체 생성
                  const item = {
                    r_tc_name: row.r_tc_name,
                    tc_group: tcGroupResult[0].tc_group,
                    usage_count: row.usage_count,
                  };
                  resolve(item);
                }
              );
            });
          }
        );

        //모든 Promise 해결까지 기다림
        Promise.all(promises)
          .then((finalResult) => {
            resolve(finalResult);
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }

  // 정책 유형별 테스트 현황 Method
  tcResultPolicy(): Promise<any> {
    return new Promise((resolve, reject) => {
      const sessionQuery = "SELECT s_id, p_name FROM sessions";
      connection.query(sessionQuery, (error: any, sessions: any[]) => {
        if (error) {
          return reject(error);
        }

        const promises = sessions.map(session => {
          return new Promise((resolve, reject) => {
            const tcResultQuery = "SELECT r_tc_name, r_context FROM sessionresult WHERE s_id = ?";
            connection.query(tcResultQuery, [session.s_id], (error, tcResults: any[]) => {
              if (error) {
                return reject(error);
              }

              const policyQuery = "SELECT tc_name, tc_group FROM tc_policy WHERE p_name = ?";
              connection.query(policyQuery, [session.p_name], (error, policyResults: any[]) => {
                if (error) {
                  return reject(error);
                }

                // 그룹별로 요약 결과를 저장할 객체
                const groupSummary: { [key: string]: { success: number, fail: number, nonTest: number } } = {};

                policyResults.forEach(policy => {
                  // 그룹이 존재하지 않으면 초기화
                  if (!groupSummary[policy.tc_group]) {
                    groupSummary[policy.tc_group] = { success: 0, fail: 0, nonTest: 0 };
                  }

                  const matchTCResult = tcResults.find(tc => tc.r_tc_name === policy.tc_name);
                  if (matchTCResult) {
                    if (matchTCResult.r_context.includes('PASS')) {
                      groupSummary[policy.tc_group].success++;
                    } else if (matchTCResult.r_context.includes('FAIL') || matchTCResult.r_context.includes('ERROR')) {
                      groupSummary[policy.tc_group].fail++;
                    } else {
                      groupSummary[policy.tc_group].nonTest++;
                    }
                  } else {
                    groupSummary[policy.tc_group].nonTest++;
                  }
                });

                resolve(groupSummary);
              });
            });
          });
        });

        Promise.all(promises)
          .then(results => {
            // 결과를 병합
            const mergedSummary: { [key: string]: { success: number, fail: number, nonTest: number } } = {};

            results.forEach(groupSummary => {
              for (const [group, summary] of Object.entries(groupSummary as { [key: string]: { success: number, fail: number, nonTest: number } })) {
                if (!mergedSummary[group]) {
                  mergedSummary[group] = { success: 0, fail: 0, nonTest: 0 };
                }

                mergedSummary[group].success += summary.success;
                mergedSummary[group].fail += summary.fail;
                mergedSummary[group].nonTest += summary.nonTest;
              }
            });

            resolve(mergedSummary);
          })
          .catch(reject);
      });
    });
  }

  //실패율이 높은 테스트 케이스 TOP 5
  failTC():Promise<any>{
    return new Promise((resolve, reject) => {
      const tcResultQuery = `select r_tc_name, count(*) as all_count, sum(if(r_context regexp 'FAIL|ERROR', 1, 0)) as fa_count from sessionResult group by r_tc_name order by fa_count desc limit 5`;
      connection.query(tcResultQuery, (error, result) => {
        if(error){
          reject(error);
        }

        //Promise 배열 생성
        const promises = result.map((row: { r_tc_name: any; all_count:any, fa_count: any; }) => {
          return new Promise<any>((resolve, reject) => {
            //tc Group 조회
            const tcGroupQuery = `select tc_group from testcases where tc_name = ?`;
            connection.query(tcGroupQuery, [row.r_tc_name], (error, tcGroupResult) => {
              if(error) {
                return reject(error);
              }

              //퍼센트 계산
              const failPercentage = (row.fa_count / row.all_count) * 100
              const item = {
                r_tc_name:row.r_tc_name,
                tc_group:tcGroupResult[0].tc_group,
                failPercentage:failPercentage+"%"
              }
              resolve(item);
            });
          });
        });

        //모든 Promise가 해결될 때까지 기다림
        Promise.all(promises)
        .then((finalResult) => {
          resolve(finalResult);
        })
        .catch((err) => {
          reject(err);
        })
      })
    })
  }

  //실패 세션 수 계산
  failSessionCount():Promise<any>{
    return new Promise((resolve, reject) => {
      const sessionQuery = `select s_id from sessions`
      connection.query(sessionQuery, (error, result) => {
        if(error){
          reject(error);
        }
        let failSession_count = 0;
        let succSession_count = 0;
        //Promise 배열 생성
        const promises = result.map((row: { s_id: any;}) => {
          return new Promise<any>((resolve, reject) => {
            //s_id로 r_context 가져온 다음 확인하면 됨
            const contQuery = `select r_context from sessionresult where s_id = ?`;

            connection.query(contQuery, [row.s_id],(error, contResult) => {
              if(error) {
                return reject(error);
              }
              let hasFail = false;
              // r_context 배열 중 하나라도 'FAIL'이 있는지 확인
              contResult.map((cont: { r_context: string | string[] }) => {
                if (cont.r_context.includes('FAIL')) {
                  hasFail = true;
                }
              });
  
              if (hasFail) {
                failSession_count += 1;
              } else {
                succSession_count += 1;
              }
              resolve(null); // 개별 프로미스는 실제 데이터가 필요 없으므로 null을 반환
            });
          });
        });

        //모든 Promise가 해결될 때까지 기다림
        Promise.all(promises)
        .then(() => {
          const finalResult = {
            all_count: result.length,
            failSession_count: failSession_count,
            succSession_count: succSession_count,
          };
          resolve(finalResult);
        })
        .catch((err) => {
          reject(err);
        });
      })
    })
  }
  //사용된 정책 유형 비율
  mostTcPolicyPercent():Promise<any>{
    return new Promise((resolve, reject) => {
      const sessionQuery = `select p_name, count(p_name) as p_count from sessions group by p_name`;
      connection.query(sessionQuery, (error, result) => {
        if(error){
          reject(error);
        }
        let totalCount = 0;
        //세션의 총 숫자 확인
        result.forEach((row: { p_name: any; p_count: any; }) => {
          totalCount += row.p_count;
        });

        //분해해서 p_name이 가지고 있는 tc_group 가져오기
        const promises = result.map((row: { p_name: any; p_count: any; }) => {
          return new Promise<any>((resolve, reject) => {
            //p_name으로 tc_group 가져오는 쿼리
            const tcGroupQuery = `select distinct(tc_group) from tc_policy where p_name = ?`;
            connection.query(tcGroupQuery, [row.p_name], (error, tcGroupResult) => {
              if(error) {
                return reject(error);
              }

              //가져온 그룹이랑 해당 그룹으로 만든 세션의 수를 비례해서 각 그룹을 백분율로 환산
              if(tcGroupResult.length > 0){
                const tcGroup = tcGroupResult[0].tc_group;
                const percentage = (row.p_count / totalCount) * 100;
                resolve({tc_group:tcGroup, percentage:percentage});
              } else {
                resolve(null);
              }
            });
          });
        });

        Promise.all(promises)
        .then((results => {
          const finalResults = results.filter(result => result !== null);

          //같은 tc_group은 합쳐야한다.
          const combinedResults = finalResults.reduce((acc, curr) => {
            const existing = acc.find((item: { tc_group: any; }) => item.tc_group === curr.tc_group);
            if(existing){
              existing.percentage += curr.percentage;
            } else {
              acc.push(curr);
            }

            return acc;
          }, []);

          resolve(combinedResults);
        }))
        .catch(error => {
          reject(error);
        })
      })
    })
  }

}

export default DashboardService;
