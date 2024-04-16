import connection from "../db/db";

class PolicyService {
  getPolicyList(): Promise<any> {
    const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;

    return new Promise((resolve, reject) => {
      connection.query(query, (error, result) => {
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
    let query = `select tc_id, tc_name, tc_parameter, tc_context, tc_group, tc_message from testcases`;
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
    let query = `select p_name, tc_id, p_tc_parameter from tc_policy where p_name = ?`;
    return new Promise((resolve, reject) => {
      connection.query(query, name,(error, result) => {
        if (error) {
          reject(error);
        } else {
          let tcList = [{
            p_name:'',
            tc_id:'',
            p_tc_parameter:{}
          }];
          if(result > 0){
            resolve(result);
          } else {
            resolve(tcList);
          }
        }
      });
    });
  }

  compareTestCases(testcases:any, tc_policy?:any) {
    const treeData: any[] = [];

    // 각 테스트 케이스를 그룹화하기 위한 임시 객체
    const groupMap: Record<string, any> = {};

    if(tc_policy !== undefined && tc_policy !== null){
      const policyTcIds = tc_policy ? tc_policy.map((policy: any) => policy.tc_id) : [];
        // 테스트 케이스를 그룹화
        testcases.forEach((tc: any) => {
          if (!groupMap[tc.tc_group]) {
              groupMap[tc.tc_group] = {
                  tc_group: tc.tc_group,
                  expanded: false,
                  checked: false,
                  children: []
              };
          }

          // 테스트 케이스의 tc_id가 policyTcIds에 포함되어 있으면 checked를 true로 설정
          const checked = policyTcIds.includes(tc.tc_id);
          
          groupMap[tc.tc_group].children.push({
              tc_id: tc.tc_id,
              tc_name: tc.tc_name,
              tc_context: tc.tc_context,
              tc_group: tc.tc_group,
              tc_parameter: [],
              checked: checked // 기본값으로 false로 설정
          });
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
              groupMap[tc.tc_group] = {
                  tc_group: tc.tc_group,
                  expanded: false,
                  checked: false,
                  children: []
              };
          }
          groupMap[tc.tc_group].children.push({
              tc_name: tc.tc_name,
              tc_context: tc.tc_context,
              tc_group:tc.tc_group,
              tc_parameter:[],
              checked: false // 기본값으로 false로 설정
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
  getGParameter(username:any): Promise<any> {
    let query = `select tool_ip, ivn_port, wave_port, lte_v2x_port, lte_uu_port, v2x_dut_ip, v2x_dut_port, ivn_canfd from gl_parameter where username = ?`
    return new Promise((resolve, reject) => {
      connection.query(query, username, (error, result) => {
        if (error) {
          reject(error);
        } else {
          let gParameters = [{
            tool_ip:'',
            ivn_port:'',
            wave_port:'',
            lte_v2x_port:'',
            lte_uu_port:'',
            v2x_dut_ip:'',
            v2x_dut_port:'',
            ivn_canfd:'',
          }];
          if(result.length > 0){
            resolve(result);
          } else {
            resolve(gParameters);
          }
        }
      })
    })
  }
}

export default PolicyService;
