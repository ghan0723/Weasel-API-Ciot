import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import CryptoService from "../service/cryptoService";
import { frontIP } from "../interface/ipDomain";
import { weasel } from "../interface/log";
import PolicyService from "../service/policyService";

const router: Router = express.Router();
const userService: UserService = new UserService();
const cryptoService = new CryptoService("sn0ISmjyz1CWT6Yb7dxu");
const policyService: PolicyService = new PolicyService();

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  
  if(username !== undefined && username !== null){
    res.send({ username: username });
  } else {
    res.status(500).send({username:username})
  }
});

router.get("/privilege", (req: Request, res: Response) => {
  let username = req.cookies.username;

  if(username === undefined || username === null) res.status(500);
  
  userService
    .getPrivilege(username)
    .then((result) => {
      res.send([{
        username : username,
        privilege:result[0].privilege
      }]);
    })
    .catch((error) => {
      console.error("privilege 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/pwd", (req: Request, res: Response) => {
  let username = req.query.username;
  let user = req.body;
  const encPwd = cryptoService.getEncryptUltra(user.newPwd);

  userService
    .getPwdByUsername(username)
    .then((result1) => {
      const decOldPwd = cryptoService.getDecryptUltra(result1[0].password);
      if (user.oldPwd !== decOldPwd) {
        weasel.log(username, req.socket.remoteAddress,"You entered the password incorrectly before changing it.");
        // weasel.log(username,req.socket.remoteAddress,"변경 전 비밀번호를 잘못 입력하였습니다.");
        res.status(401).send("fail");
      } else {
        if (user.newPwd !== user.oldPwd) {
          userService
            .modifyPwdByFreq(username, encPwd)
            .then((result2) => {
              weasel.log(username, req.socket.remoteAddress, "You successfully changed your account password.");
              // weasel.log(username,req.socket.remoteAddress,"계정 비밀번호 변경을 성공했습니다.");
              res.status(200).send(result2);
            })
            .catch((error) => {
              weasel.error(
                username,
                req.socket.remoteAddress,
                "Password cycle renewal failed."
              );
              // weasel.error(username,req.socket.remoteAddress,"비밀번호 주기를 새로 갱신하는데 실패하였습니다.");
              res.status(500).send("Internal Server Error");
            });
        } else {
          weasel.log(username,req.socket.remoteAddress,"The new password you entered matches the existing password.");
          // weasel.log(username,req.socket.remoteAddress,"입력한 새 비밀번호가 기존의 비밀번호와 일치합니다.");
          res.status(403).send({
              error : "입력한 새 비밀번호가 기존의 비밀번호와 일치합니다."
            });
        }
      }
    })
    .catch((error2) => {
      weasel.error(
        username,
        req.socket.remoteAddress,
        "An error occurred while running a query to the database for the pre-change password."
      );
      // weasel.error(username,req.socket.remoteAddress,"변경 전 비밀번호를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생했습니다.");
      res.status(500).send("error :" + error2);
    });
});

router.post('/login', (req:Request, res:Response) => {
  let username = req.body.username;
  let password = req.body.passwd;
  //현재 로그인 시도 중인 계정의 등급을 먼저 확인한다.
  userService.getPrivilege(username)
  .then((privilege)=>{
    userService.getLogin(username)
    .then((user) => {
      //DB의 비밀번호를 복호화 한다.
      let decPwd = cryptoService.getDecryptUltra(user[0].password);
      //계정의 정보를 확인 한다.
      if(privilege[0].privilege === 1){
        //관리자 계정일 때
        //비밀번호를 확인한다.
        if(password === decPwd){
          //로그인한 비밀번호가 같을 때
          res.cookie("username", user[0].username, {
            secure:true,
            maxAge:3600 * 1000, //만료시간 설정
            path:'/', //쿠키 사용 경로 설정
          })
          res.status(200).send({freq:false});
        } else {
          //비밀번호가 같지 않을 때
          res.status(400).send({message : "비밀번호 불일치로 인한 로그인 실패"});
        }
      } else {
        //관리자 계정이 아닐 때
        //접속 가능 여부 부터 확인
        if(user[0].enabled === 0){
          //접속 불가능
          res.status(400).send({enabled:false});
        } else {
          //접속 가능
          //비밀번호를 확인한다.
          if(password === decPwd){
            //로그인한 비밀번호가 같을 때
            //비밀번호 실패 카운트를 초기화해줘야한다.
            userService.failCountDefault(username)
            .then((failCount) => {
              //실패 카운트 초기화 완료
              //비밀번호 주기를 확인한다.
              userService.checkPwdFreq(username)
              .then((freq) => {
                if(freq){
                  //주기를 변경해야한다.
                  res.status(200).send({freq:true, username:user[0].username});
                } else {
                  //주기를 아직 변경하지 않아도 된다.
                  res.cookie("username", user[0].username, {
                    secure:true,
                    maxAge:3600 * 1000, //만료시간 설정
                    path:'/', //쿠키 사용 경로 설정
                  })
                  res.status(200).send({freq:false});
                }
              })
              .catch((freqError) => {
                res.status(500).send({message : "비밀번호 변경주기 db에서 가져오기 실패"});
              })
            })
            .catch((failCountError) => {
              res.status(500).send({message : "비밀번호 실패 카운트 db에 초기화 실패"});
            })
          } else {
            //비밀번호가 같지 않을 때
            //실패 카운트를 하나 올려주어야 한다.
            userService.disabledUser(username, user[0].fail_count + 1)
            .then((enabled) => {
              if(user[0].fail_count + 1 >= 5){
                //비밀번호 실패 횟수가 5번을 넘었다.
                res.status(400).send({message : "비밀번호 불일치로 인한 로그인 실패 (실패횟수 5 이상)"});
              } else {
                //비밀번호 실패 횟수가 아직 5번 보다 낮다.
                res.status(400).send({message : "비밀번호 불일치로 인한 로그인 실패 (실패횟수 5 보다 작음)"});
              }
            })
            .catch((disableError) => {
              res.status(500).send({message : "비밀번호 실패 횟수 db에서 업데이트 실패"});
            })
          }
        }
      }
    })
    .catch((getUserError) => {
      //로그인을 시도한 계정을 db에서 가져오는데 실패한 에러
      res.status(500).send({message : "계정 정보 db에서 가져오기 실패"});
    })
  })
  .catch((getPriError) => {
    //계정 등급 가져오는데 실패한 에러
    res.status(500).send({message:"계정 등급 db에서 가져오기 실패"});
  })
})

router.get("/all", (req:Request, res:Response) => {
  let username = req.query.username;
  let category = req.query.category;
  let searchWord = req.query.searchWord;

  //현재 접속 중인 계정이 어떤 계정인지 확인한다. 
  userService.getUser(username)
  .then((user) => {
    if(user[0].privilege === 1){
      //현재 접속 계정이 관리자일 때
      userService.getUserList(user[0].privilege, category, searchWord)
      .then((userList) => {
        //사용자 리스트를 가져온다(카테고리랑 검색 결과에 따라서)
        if(userList.length > 0){
          //사용자 리스트가 존재할 때
          res.status(200).send(userList);
        } else {
          //사용자 리스트가 아예 없을 때(빈 리스트를 넘겨준다.)
          res.status(200).send([{
            username:'',
            privilege:'',
            enabled:""
          }]);
        }
      })
      .catch((userListError) => {
        //검색이나 무언가 잘못되었을 때 기본 리스트를 넘겨준다.
        res.status(500).send([{
          username:'',
          privilege:'',
          enabled:""
        }])
      })
    } else {
      //관리자 계정이 아니므로 사용자 관리에 접속이 불가능함
      res.status(400).send("trycatch에서 catch 보내는 오류이면서 동시에 유저 계정이라 사용자 관리로 접속 불가능");
    }
  })
  .catch((userError => {
    res.status(500).send({message : "계정 정보 db에서 가져오기 실패"});
  }))
})

router.post('/add', (req:Request, res:Response) => {
  let user = req.body;
  //가장 먼저 계정명 중복 검사를 실시한다.
  userService.checkUsername(user.username)
  .then((exist) => {
    if(exist.exists){
      //입력한 계정명은 중복되는 계정명이다.
      res.status(400).send({message : "중복되는 계정명을 사용하여 실패"});
    } else {
      //중복되지 않는 계정명을 입력하였다.
      //비밀번호를 암호화 해주고 비밀번호 변경주기를 가져온다.
      userService.getFreq()
      .then((freq) => {
        let encPwd = cryptoService.getEncryptUltra(user.password);
        let newUser = {
          username:user.username,
          password:encPwd,
          privilege:user.privilege,
          freq:freq[0].freq
        }
        userService.addUser(newUser)
        .then((addUser) => {
          //새로운 계정 생성 완료 이후 해당 계정 이름으로 settings 하나 생성하기
          policyService.addGParameter(user.username)
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((addGParamError) => {
            res.status(500).send({message : "새로운 사용자의 GParameter 저장하기 실패"});
          })
        })
        .catch((addError) => {
          res.status(500).send({message : "새로운 사용자 db에 저장하기 실패"});
        })
      })
      .catch((freqError) => {
        res.status(500).send({message : "비밀번호 변경주기 db에서 가져오기 실패"});
      })
    }
  })
  .catch((existError) => {
    res.status(500).send({message : "중복 확인 정보 db에서 가져오기 실패"});
  })
})

router.get('/modify', (req:Request, res:Response) => {
  let username = req.query.username;
  //업데이트할 계정의 정보를 먼저 가져온다.
  userService.getUser(username)
  .then((user) => {
    //가져온 계정의 비밀번호를 복호화 해야한다.
    let decPwd = cryptoService.getDecryptUltra(user[0].password);
    res.status(200).send([{
      username:user[0].username,
      password:decPwd,
      privilege:user[0].privilege,
      enabled:user[0].enabled
    }]);
  })
  .catch((userError) => {
    res.status(500).send({message : "변경할 계정의 정보 db에서 가져오기 실패"});
  })
})

router.post('/modify', (req:Request, res:Response) => {
  let oldname = req.query.oldname;
  let user = req.body;
  //일단 변경한 계정명이 중복되지 않는지 확인
  userService.checkUsername(user.username, oldname)
  .then((exist) => {
    if(exist.exists){
      //현재 변경한 계정명은 중복되는 계정명임 
      res.status(400).send({message : "입력하신 계정명은 중복된 계정명입니다."});
    } else {
      //계정명이 이전과 동일하거나 중복되지 않는 계정명으로 변경함
      //변경할 계정의 비밀번호를 암호화 해줘야한다.
      let encPwd = cryptoService.getEncryptUltra(user.password);
      //이제 비밀번호가 변경되었는지 확인
      userService.getPwdByUsername(oldname)
      .then((pwd) => {
      //가져온 비밀번호를 일단 복호화 해줘야한다.
      let decOldPwd = cryptoService.getDecryptUltra(pwd[0].password);
      if(user.password !== decOldPwd){
        let modUser = {
          username:user.username,
          password:encPwd,
          privilege:user.privilege,
          enabled:user.enabled,
          freq:true
        }
        //변경되었으면 주기 업데이트
        userService.modifyUser(modUser, oldname)
        .then((modifyUser) => {
          res.status(200).send({message:"비밀번호가 변경된 계정의 업데이트 성공"})
        })
        .catch((modifyError) => {
          res.status(500).send({message : "비밀번호가 변경된 계정의 업데이트 실패"});
        })
      } else {
        //변경되지 않았으면 주기 업데이트 x
        let modUser = {
          username:user.username,
          password:encPwd,
          privilege:user.privilege,
          enabled:user.enabled,
          freq:false
        }
        userService.modifyUser(modUser, oldname)
        .then((modifyUser) => {
          res.status(200).send({message:"비밀번호가 변경되지 않은 계정의 업데이트 성공"})
        })
        .catch((modifyError) => {
          res.status(500).send({message : "비밀번호가 변경되지 않은 계정의 업데이트 실패"});
        })
      }
      })
      .catch((pwdError) => {
        res.status(500).send({message : "변경할 계정의 db에 저장된 비밀번호 가져오기 실패"});    
      })
    }
  })
  .catch((existError) => {
    res.status(500).send({message : "변경할 계정명의 중복 여부를 db에서 가져오기 실패"});
  })
})

router.post("/rm", (req:Request, res:Response) => {
  let users = req.body;
  let username = req.query.username;
  userService.removeUser(users)
  .then((remove) => {
    res.status(200).send({message : "사용자 계정 삭제 성공"})
  })
  .catch((rmError) => {
    res.status(500).send({message : "사용자 계정 삭제 실패"});
  })
})

export = router;
