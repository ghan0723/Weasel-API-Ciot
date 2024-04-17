"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../db/db"));
class PolicyService {
    getPolicyList() {
        const query = `select p_name as name, p_distinction as distinction, p_author as author from policys`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
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
                }
                else {
                    reject(error);
                }
            });
        });
    }
    postTcUpload() {
        const query = ``;
        return new Promise((resolve, reject) => { });
    }
    getTestCases() {
        let query = `select tc_id, tc_name, tc_parameter, tc_context, tc_group, tc_message from testcases`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    getTCByPName(name) {
        let query = `select p_name, tc_id, p_tc_parameter from tc_policy where p_name = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, name, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let tcList = [{
                            p_name: '',
                            tc_id: '',
                            p_tc_parameter: {}
                        }];
                    if (result.length > 0) {
                        resolve(result);
                    }
                    else {
                        resolve(tcList);
                    }
                }
            });
        });
    }
    getInsertSessions(username, policyname) {
        const query = `insert into sessions (username, p_name, s_name, s_time, s_response, s_log) values ('${username}', '${policyname}', now(), '', '[{}]', '[{}]');`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    // 삽입 후에 자동으로 생성된 s_id 값을 반환
                    resolve(result.insertId);
                }
            });
        });
    }
    compareTestCases(testcases, tc_policy) {
        const treeData = [];
        // 각 테스트 케이스를 그룹화하기 위한 임시 객체
        const groupMap = {};
        if (tc_policy !== undefined && tc_policy !== null) {
            const policyTcIds = tc_policy.map((policy) => policy.tc_id);
            // 테스트 케이스를 그룹화하고 tc_id를 기준으로 tc_policy에서 해당 테스트 케이스의 p_tc_parameter를 가져와서 treeData에 추가
            testcases.forEach((tc) => {
                if (!groupMap[tc.tc_group]) {
                    groupMap[tc.tc_group] = {
                        tc_group: tc.tc_group,
                        expanded: false,
                        checked: false,
                        children: []
                    };
                }
                const checked = policyTcIds.includes(tc.tc_id);
                const tcNode = {
                    tc_id: tc.tc_id,
                    tc_name: tc.tc_name,
                    tc_context: tc.tc_context,
                    tc_group: tc.tc_group,
                    tc_parameter: [],
                    checked: checked
                };
                // 테스트 케이스의 tc_id가 policyTcIds에 포함되어 있으면 해당 테스트 케이스의 p_tc_parameter를 가져와서 추가
                if (checked) {
                    const policy = tc_policy.find((policy) => policy.tc_id === tc.tc_id);
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
        }
        else {
            // 테스트 케이스를 그룹화
            testcases.forEach((tc) => {
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
                    tc_group: tc.tc_group,
                    tc_parameter: [],
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
    getGParameter(username) {
        let query = `select tool_ip, ivn_port, wave_port, lte_v2x_port, lte_uu_port, v2x_dut_ip, v2x_dut_port, ivn_canfd from gl_parameter where username = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let gParameters = [{
                            tool_ip: '',
                            ivn_port: '',
                            wave_port: '',
                            lte_v2x_port: '',
                            lte_uu_port: '',
                            v2x_dut_ip: '',
                            v2x_dut_port: '',
                            ivn_canfd: '',
                        }];
                    if (result.length > 0) {
                        resolve(result);
                    }
                    else {
                        resolve(gParameters);
                    }
                }
            });
        });
    }
}
exports.default = PolicyService;
