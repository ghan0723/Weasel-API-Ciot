import connection from "../db/db";

class PolicyService {
  getPolicyList(): Promise<any> {
    const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        console.log('result',result);
        
        if (result) {
          if (result.length === 0) {
            result = [
              {
                name: " ",
                distinction: " ",
                author: " ",
              },
            ];
          }
          resolve(result);
        } else {
          reject(error);
        }
      });
    });
  }

  postTcUpload(): Promise<any> {
    const query = ``;
    return new Promise((resolve, reject) => {});
  }

  getTestCases(): Promise<any> {
    let query = `select tc_name, tc_parameter, tc_context, tc_group, tc_message from testcases order by tc_group`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getGlParameter(): Promise<any> {
    let query = `SELECT * FROM gl_parameter WHERE g_name IN (SELECT DISTINCT tc_group FROM testcases);`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  getTCByPName(name: any): Promise<any> {
    let query = `select p_name, tc_name, p_tc_parameter from tc_policy where p_name = ?`;
    return new Promise((resolve, reject) => {
      connection.query(query, name, (error, result) => {
        if (error) {
          reject(error);
        } else {
          let tcList = [
            {
              p_name: "",
              tc_name: "",
              p_tc_parameter: {},
            },
          ];
          if (result.length > 0) {
            resolve(result);
          } else {
            resolve(tcList);
          }
        }
      });
    });
  }

  getInsertSessions(username: any, policyname: any): Promise<any> {
    const query = `insert into sessions (username, p_name, s_name, s_time, s_enabled) values ('${username}', '${policyname}', now(), '', 1);`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if (error) {
          reject(error);
        } else {
          // 삽입 후에 자동으로 생성된 s_id 값을 반환
          resolve(result.insertId);
        }
      });
    });
  }

  compareTestCases(testcases: any, gl_parameter: any, tc_policy?: any) {
    let groupParameter:any;
    const treeData: any[] = [];

    // 각 테스트 케이스를 그룹화하기 위한 임시 객체
    const groupMap: Record<string, any> = {};

    if (tc_policy !== undefined && tc_policy !== null) {
      const policyNames = tc_policy.map((policy: any) => policy.tc_name);

      // 테스트 케이스를 그룹화하고 tc_name를 기준으로 tc_policy에서 해당 테스트 케이스의 p_tc_parameter를 가져와서 treeData에 추가
      testcases.forEach((tc: any) => {
        if (!groupMap[tc.tc_group]) {
          groupMap[tc.tc_group] = {
            tc_group: tc.tc_group,
            expanded: true,
            checked: false,
            children: [],
            tc_parameter:gl_parameter
          };
        }

        const checked = policyNames.includes(tc.tc_name);
        const tcNode: any = {
          tc_name: tc.tc_name,
          tc_context: tc.tc_context,
          tc_group: tc.tc_group,
          tc_parameter: tc.tc_parameter,
          checked: checked,
        };

        // 테스트 케이스의 tc_name가 policyTcIds에 포함되어 있으면 해당 테스트 케이스의 p_tc_parameter를 가져와서 추가
        if (checked) {
          const policy = tc_policy.find((policy: any) => policy.tc_name === tc.tc_name);
          if (policy && policy.p_tc_parameter) {
            tcNode.tc_parameter = policy.p_tc_parameter;
          }
          groupMap[tc.tc_group].checked = true;
        }

        groupMap[tc.tc_group].children.push(tcNode);
      });

      // 그룹화된 테스트 케이스를 treeData에 추가
      for (const groupName in groupMap) {
        treeData.push(groupMap[groupName]);
      }

      return treeData;
    } else {
      // 테스트 케이스를 그룹화
      testcases.forEach((tc: any) => {
        if (!groupMap[tc.tc_group]) {
          
          for(let i=0; i<gl_parameter.length; i++) {
            if(gl_parameter[i].g_name == tc.tc_group) {

              groupParameter = gl_parameter[i].g_parameter;
              break;
            }
          }

          groupMap[tc.tc_group] = {
            tc_group: tc.tc_group,
            expanded: true,
            checked: false,
            children: [],
            tc_parameter : groupParameter
          };
        }
        groupMap[tc.tc_group].children.push({
          tc_name: tc.tc_name,
          tc_context: tc.tc_context,
          tc_group: tc.tc_group,
          tc_parameter: tc.tc_parameter,
          checked: false, // 기본값으로 false로 설정
        });
      });

      // 그룹화된 테스트 케이스를 treeData에 추가
      for (const groupName in groupMap) {
        treeData.push(groupMap[groupName]);
      }

      return treeData;
    }
  }

  //global parameter 가져오기
  getGParameter(username: any): Promise<any> {
    let query = `select platform_ip, platform_port, ivn_port, wave_port, lte_v2x_port, lte_uu_port from settings where username = ?`;
    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          reject(error);
        } else {
          let gParameters = [
            {
              platform_ip: "",
              platform_port: "",
              wave_port: "",
              lte_v2x_port: "",
              lte_uu_port: "",
            },
          ];
          if (result.length > 0) {
            resolve(result);
          } else {
            resolve(gParameters);
          }
        }
      });
    });
  }

  postInsertPolicy(username:any ,name:any,data: any, policyDescription?:string) {
    // 각 데이터 요소를 처리하는 Promise 배열을 생성합니다.
    const promises = data.map((item: any) => {
      if (item.checked) {
        item.children.map((tcData:any) => {
          if(tcData.checked) {
            const query = `Insert Into tc_policy (p_name, tc_name, p_tc_parameter) values ('${name}', '${tcData.tc_name}', '${tcData.tc_parameter}');`

            return new Promise((resolve, reject) => {
              connection.query(query, (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              });
            });
          }
        })
      }
    });

    if(promises.length >= 1) {
      const query = `Insert Into policys (p_name, p_author, p_distinction) values ('${name}', '${username}', '${policyDescription}');`

      promises.unshift(
        new Promise((resolve, reject) => {
        connection.query(query, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      }));      
    }

    // 모든 Promise를 동시에 실행하고, 모든 작업이 완료되면 완료되었다는 것을 알립니다.
    return Promise.all(promises)
      .then((results) => {
        return results; // 모든 삽입 작업의 결과를 반환
      })
      .catch((error) => {
        throw error; // 에러 발생시 예외를 throw하여 호출자에게 알림
      });
  }

  addGParameter(username:any): Promise<any> {
    let query = `insert into settings (username, uid, platform_ip, platform_port, ivn_port, wave_port, lte_v2x_port, lte_uu_port) `+
    ` values ('${username}',  0, '192.168.123.253', '12001', '12002', '12003', '12004', '13001')`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  updateGParameter(username:any, gParameter:any): Promise<any> {
    let query = `update settings set platform_ip = '${gParameter.platform_ip}', platform_port = '${gParameter.platform_port}', ivn_port = '${gParameter.ivn_port}', wave_port = '${gParameter.wave_port}', lte_v2x_port = '${gParameter.lte_v2x_port}', `+
    `lte_uu_port = '${gParameter.lte_uu_port}', uid = uid+1 where username = ?`;
    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  //policy 중복 검사
  duplicatePolicy(policyname:any): Promise<any> {
    let query = `SELECT COUNT(*) AS count FROM policys WHERE p_name = ?`;
    return new Promise((resolve, reject) => {
      connection.query(query, policyname, (error, result) => {
        if (error) {
            reject(error);
        } else {
            // 결과의 count 값이 0보다 크면 중복된 policy가 있음을 나타내므로 true를 반환하고, 그렇지 않으면 false를 반환합니다.
            const count = result[0].count;
            resolve(count > 0);
        }
      });
    })
  }

  addPolicy(username:any, policyName:any, treeData:any, policyDescription?:string):Promise<any>{

    let p_parameter;
    // 추후 수정 예정
    treeData.map((data:any) => {
      if(data.tc_group === 'CAVP') {
        p_parameter = data.tc_parameter
      }
    })

    const query = `Insert Into policys (p_name, p_author, p_distinction, p_parameter) values ('${policyName}', '${username}', '${policyDescription}', '${p_parameter}');`
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })
  }

  addTcPolicy(policyName:any, data:any): Promise<any>{
    const tcPolicy = data.map((item:any) => {
      if(item.checked){
        item.children.map((tcData:any) => {
          if(tcData.checked){
            const query = `Insert Into tc_policy (p_name, tc_name, p_tc_parameter) values ('${policyName}', '${tcData.tc_name}', '${tcData.tc_parameter}');`;
            return new Promise((resolve, reject) => {
              connection.query(query, (error, result) => {
                if(error){
                  reject(error);
                } else {
                  resolve(result);
                }
              })
            })
          }
        })
      }
    })
    return Promise.all(tcPolicy)
    .then((result) => {
      return (result);
    }) 
    .catch((error) => {
      return ({message : '에러 발생'})
    })
  }

  getPolicyDescription(p_name:any):Promise<any> {
    let query = `select p_distinction from policys where p_name = ?`
    return new Promise((resolve, reject) => {
      connection.query(query, p_name, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result[0].p_distinction);
        }
      })
    })
  }

  deletePolicy(policyName:any): Promise<any> {

    const query = `delete from policys where p_name = '${policyName}'`;
    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result);
        }
      })
    })

  }

  getPolicyParameter(p_name:any):Promise<any> {
    let query = `select p_parameter from policys where p_name = ?`
    return new Promise((resolve, reject) => {
      connection.query(query, p_name, (error, result) => {
        if(error){
          reject(error);
        } else {
          resolve(result[0].p_parameter);
        }
      })
    })
  }

}

export default PolicyService;
