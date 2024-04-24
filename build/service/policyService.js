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
        let query = `select tc_name, tc_parameter, tc_context, tc_group, tc_message from testcases`;
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
    getGlParameter() {
        let query = `SELECT * FROM gl_parameter WHERE g_name IN (SELECT DISTINCT tc_group FROM testcases);`;
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
        let query = `select p_name, tc_name, p_tc_parameter from tc_policy where p_name = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, name, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let tcList = [
                        {
                            p_name: "",
                            tc_name: "",
                            p_tc_parameter: {},
                        },
                    ];
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
        const query = `insert into sessions (username, p_name, s_name, s_time, s_enabled) values ('${username}', '${policyname}', now(), '', 1);`;
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
    compareTestCases(testcases, tc_policy, gl_parameter) {
        let groupParameter;
        const treeData = [];
        // 각 테스트 케이스를 그룹화하기 위한 임시 객체
        const groupMap = {};
        if (tc_policy !== undefined && tc_policy !== null) {
            const policyNames = tc_policy.map((policy) => policy.tc_name);
            // 테스트 케이스를 그룹화하고 tc_name를 기준으로 tc_policy에서 해당 테스트 케이스의 p_tc_parameter를 가져와서 treeData에 추가
            testcases.forEach((tc) => {
                if (!groupMap[tc.tc_group]) {
                    groupMap[tc.tc_group] = {
                        tc_group: tc.tc_group,
                        expanded: true,
                        checked: false,
                        children: [],
                        tc_parameter: gl_parameter,
                    };
                }
                const checked = policyNames.includes(tc.tc_name);
                const tcNode = {
                    tc_name: tc.tc_name,
                    tc_context: tc.tc_context,
                    tc_group: tc.tc_group,
                    tc_parameter: tc.tc_parameter,
                    checked: checked,
                };
                // 테스트 케이스의 tc_name가 policyTcIds에 포함되어 있으면 해당 테스트 케이스의 p_tc_parameter를 가져와서 추가
                if (checked) {
                    const policy = tc_policy.find((policy) => policy.tc_name === tc.tc_name);
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
            console.log('gl_parameter', gl_parameter.length);
            console.log('gl_parameter', gl_parameter[0].g_name);
            console.log('gl_parameter 1', gl_parameter[1]);
            console.log('gl_parameter 2', gl_parameter[2]);
            // 테스트 케이스를 그룹화
            testcases.forEach((tc) => {
                if (!groupMap[tc.tc_group]) {
                    console.log('tc.tc_group', tc.tc_group);
                    for (let i = 0; i < gl_parameter.length; i++) {
                        console.log('gl_parameter[i].g_name', gl_parameter[i].g_name);
                        if (gl_parameter[i].g_name == tc.tc_group) {
                            groupParameter = gl_parameter[i].g_parameter;
                            break;
                        }
                    }
                    console.log('groupParameter', groupParameter);
                    groupMap[tc.tc_group] = {
                        tc_group: tc.tc_group,
                        expanded: true,
                        checked: false,
                        children: [],
                        tc_parameter: groupParameter
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
            console.log('treeData', treeData);
            return treeData;
        }
    }
    //global parameter 가져오기
    getGParameter(username) {
        let query = `select tool_ip, ivn_port, wave_port, lte_v2x_port, lte_uu_port, v2x_dut_ip, v2x_dut_port, ivn_canfd from settings where username = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    let gParameters = [
                        {
                            tool_ip: "",
                            ivn_port: "",
                            wave_port: "",
                            lte_v2x_port: "",
                            lte_uu_port: "",
                            v2x_dut_ip: "",
                            v2x_dut_port: "",
                            ivn_canfd: "",
                        },
                    ];
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
    postInsertPolicy(username, name, data, policyDescription) {
        // 각 데이터 요소를 처리하는 Promise 배열을 생성합니다.
        const promises = data.map((item) => {
            if (item.checked) {
                item.children.map((tcData) => {
                    if (tcData.checked) {
                        const query = `Insert Into tc_policy (p_name, tc_name, p_tc_parameter) values ('${name}', '${tcData.tc_name}', '${tcData.tc_parameter}');`;
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
                });
            }
        });
        if (promises.length >= 1) {
            const query = `Insert Into policys (p_name, p_author, p_distinction) values ('${name}', '${username}', '${policyDescription}');`;
            promises.unshift(new Promise((resolve, reject) => {
                db_1.default.query(query, (error, result) => {
                    if (error) {
                        reject(error);
                    }
                    else {
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
    addGParameter(username) {
        let query = `insert into settings (username, uid, tool_ip, ivn_port, wave_port, lte_v2x_port, lte_uu_port, v2x_dut_ip, v2x_dut_port, ivn_canfd) ` +
            ` values ('${username}',  0, '192.168.123.253', '12001', '12002', '12003', '12004', '192.168.123.201', '13001', '0')`;
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
    updateGParameter(username, gParameter) {
        let query = `update settings set tool_ip = '${gParameter.tool_ip}', ivn_port = '${gParameter.ivn_port}', wave_port = '${gParameter.wave_port}', lte_v2x_port = '${gParameter.lte_v2x_port}', ` +
            `lte_uu_port = '${gParameter.lte_uu_port}', v2x_dut_ip = '${gParameter.v2x_dut_ip}', v2x_dut_port = '${gParameter.v2x_dut_port}', ivn_canfd = '${gParameter.ivn_canfd}', uid = uid+1 where username = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, username, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
            });
        });
    }
    //policy 중복 검사
    duplicatePolicy(policyname) {
        let query = `SELECT COUNT(*) AS count FROM policys WHERE p_name = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, policyname, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    // 결과의 count 값이 0보다 크면 중복된 policy가 있음을 나타내므로 true를 반환하고, 그렇지 않으면 false를 반환합니다.
                    const count = result[0].count;
                    resolve(count > 0);
                }
            });
        });
    }
    addPolicy(username, policyName, policyDescription) {
        const query = `Insert Into policys (p_name, p_author, p_distinction) values ('${policyName}', '${username}', '${policyDescription}');`;
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
    addTcPolicy(policyName, data) {
        const tcPolicy = data.map((item) => {
            if (item.checked) {
                item.children.map((tcData) => {
                    if (tcData.checked) {
                        const query = `Insert Into tc_policy (p_name, tc_name, p_tc_parameter) values ('${policyName}', '${tcData.tc_name}', '${tcData.tc_parameter}');`;
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
                });
            }
        });
        return Promise.all(tcPolicy)
            .then((result) => {
            return (result);
        })
            .catch((error) => {
            return ({ message: '에러 발생' });
        });
    }
    getPolicyDescription(p_name) {
        let query = `select p_distinction from policys where p_name = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, p_name, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result[0].p_distinction);
                }
            });
        });
    }
    deletePolicy(policyName) {
        const query = `delete from policys where p_name = '${policyName}'`;
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
    getPolicyParameter(p_name) {
        let query = `select p_parameter from policys where p_name = ?`;
        return new Promise((resolve, reject) => {
            db_1.default.query(query, p_name, (error, result) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result[0].p_parameter);
                }
            });
        });
    }
    getGlParameter() {
        let query = `SELECT * FROM gl_parameter WHERE g_name IN (SELECT DISTINCT tc_group FROM testcases);`;
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
}
exports.default = PolicyService;
