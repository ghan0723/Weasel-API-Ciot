import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import CryptoService from "../service/cryptoService";
import { frontIP } from "../interface/ipDomain";
import { weasel } from "../interface/log";

const router: Router = express.Router();
const userService: UserService = new UserService();
const cryptoService = new CryptoService("sn0ISmjyz1CWT6Yb7dxu");

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  
  if(username !== undefined && username !== null){
    res.json({ username: username });
  } else {
    res.status(500).send({username})
  }
});

router.get("/privilege", (req: Request, res: Response) => {
  let username = req.cookies.username;
  
  userService
    .getPrivilege(username)
    .then((result) => {   
      res.send(result);
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
      const decOldPwd = cryptoService.getDecryptUltra(result1[0].passwd);
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
  let passwd = req.body.passwd;
  //현재 로그인 시도 중인 계정의 등급을 먼저 확인한다.
  userService.getPrivilege(username)
  .then((privilege)=>{
    userService.getLogin(username)
    .then((user) => {
      //DB의 비밀번호를 복호화 한다.
      let decPwd = cryptoService.getDecryptUltra(user[0].passwd);
      //계정의 정보를 확인 한다.
      if(privilege[0].privilege === 1){
        //관리자 계정일 때
        //비밀번호를 확인한다.
        if(passwd === decPwd){
          //로그인한 비밀번호가 같을 때
          res.cookie("username", user[0].username, {
            secure:true,
            maxAge:3600 * 1000, //만료시간 설정
            path:'/', //쿠키 사용 경로 설정
          })
          res.status(200).send({freq:false});
        } else {
          //비밀번호가 같지 않을 때
          res.status(400).send("비밀번호 불일치로 인한 로그인 실패");
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
          if(passwd === decPwd){
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
                res.status(500).send("비밀번호 변경주기 db에서 가져오기 실패");
              })
            })
            .catch((failCountError) => {
              res.status(500).send("비밀번호 실패 카운트 db에 초기화 실패");
            })
          } else {
            //비밀번호가 같지 않을 때
            //실패 카운트를 하나 올려주어야 한다.
            userService.disabledUser(username, user[0].fail_count + 1)
            .then((enabled) => {
              if(user[0].fail_count + 1 >= 5){
                //비밀번호 실패 횟수가 5번을 넘었다.
                res.status(400).send("비밀번호 불일치로 인한 로그인 실패 (실패횟수 5 이상)");
              } else {
                //비밀번호 실패 횟수가 아직 5번 보다 낮다.
                res.status(400).send("비밀번호 불일치로 인한 로그인 실패 (실패횟수 5 보다 작음)");
              }
            })
            .catch((disableError) => {
              res.status(500).send("비밀번호 실패 횟수 db에서 업데이트 실패");
            })
          }
        }
      }
    })
    .catch((getUserError) => {
      //로그인을 시도한 계정을 db에서 가져오는데 실패한 에러
      res.status(500).send("계정 정보 db에서 가져오기 실패");
    })
  })
  .catch((getPriError) => {
    //계정 등급 가져오는데 실패한 에러
    res.status(500).send("계정 등급 db에서 가져오기 실패");
  })
})

export = router;
