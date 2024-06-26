import multer from "multer";
import { weasel } from "../interface/log";
import SettingService from "../service/settingService";
import path from "path";
import fs from "fs";
import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";

const router: Router = express.Router();
const settingService: SettingService = new SettingService();
const userService: UserService = new UserService();
let existFile: string = "";
// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "C:/Program Files (x86)/ciot/WeaselServer/Temp/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 확장자 추출
    let filename = path.basename(file.originalname, ext) + ext;
    const fullPath = path.join(
      "C:/Program Files (x86)/ciot/WeaselServer/Temp/",
      filename
    );
    existFile = "";

    if (fs.existsSync(fullPath)) {
      existFile = path.join(
        "C:/Program Files (x86)/ciot/WeaselServer/Temp/",
        filename
      );
      filename = path.basename(file.originalname, ext) + "_1" + ext;
      cb(null, filename);
    } else {
      cb(null, filename);
    }
  },
});

const upload = multer({
  storage: storage,
});

router.post("/servers", (req: Request, res: Response) => {
  const username = req.query.username;
  const server = req.body;
  settingService
    .getServerSetting()
    .then((result) => {
      const str = settingService.modServerSettingLog(server, result[0]);
      settingService
        .modServerSetting(server)
        .then(() => {
          weasel.log(username, req.ip, str);
          res.send("업데이트 성공했습니다.");
        })
        .catch(() => {
          // weasel.error(username, req.ip, '서버 설정 메뉴로 이동에 실패하였습니다.');
          weasel.error(
            username,
            req.ip,
            `[Error] The user, '${username}' failed to navigate to the Server Settings menu.`
          );

          res.status(500).send("update 하다가 에러났어요");
        });
    })
    .catch(() => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' encountered an error while executing a query to change server settings to the database.`
      );
      // weasel.error(username, req.ip, '서버 설정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.');
      res.status(500).send("update 하다가 에러났어요");
    });
});

router.get("/servers", (req: Request, res: Response) => {
  const username = req.query.username;
  userService
    .getPrivilege(username)
    .then((result1) => {
      settingService
        .getServerSetting()
        .then((result) => {
          const newAuto = result[0].svr_auto_fileupload === 1 ? true : false;
          const newResult = {
            serverPort: result[0].svr_port,
            ret: result[0].svr_file_retention_periods,
            auto: newAuto,
            interval: result[0].svr_ui_refresh_interval,
            svr_patterns_list: result[0].svr_patterns_list,
            privilege: result1[0].privilege,
          };
          if (result1[0].privilege === 3) {
            weasel.log(
              username,
              req.ip,
              `[Warn] The user, '${username}' does not have accessed to Server Settings menu.`
            );
            // weasel.log(username, req.ip, "서버 설정을 이용할 수 없는 계정입니다.");
            res.send(newResult);
          } else {
            weasel.log(
              username,
              req.ip,
              `[Info] The user, '${username}' accessed to the Server Settings menu.`
            );
            // weasel.log(username, req.ip, "서버 설정 메뉴로 이동하였습니다.");
            res.send(newResult);
          }
        })
        .catch((error) => {
          weasel.error(
            username,
            req.ip,
            `[Error] The user, '${username}' failed to navigate to the Server Settings menu.`
          );
          // weasel.error(username, req.ip, '서버 설정 메뉴로 이동에 실패하였습니다.');
          res.status(500).send("update get 하다가 에러났어요");
        });
    })
    .catch((error) => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' failed to navigate to the Server Settings menu.`
      );
      // weasel.error(username, req.ip, '서버 설정 메뉴로 이동에 실패하였습니다.');
      res.status(500).send("update get 하다가 에러났어요");
    });
});

router.post("/agents", (req: Request, res: Response) => {
  const username = req.query.username;
  const agent = req.body;
  settingService
    .getAgentSetting()
    .then((result) => {
      const str = settingService.modAgentSettingLog(agent, result[0]);
      const checkAgent = settingService.checkModAgent(result[0], agent);
      settingService
        .modAgentSetting(checkAgent)
        .then((result) => {
          weasel.log(username, req.ip, str);
          res.send(result);
        })
        .catch(() => {
          weasel.error(
            username,
            req.ip,
            `[Error] The user, '${username}' navigating to the Agent Settings Menu failed.`
          );
          // weasel.error(username, req.ip, "에이전트 설정 메뉴로 이동에 실패하였습니다.");
          res.status(500).send("agent setting post 하다가 에러났어요");
        });
    })
    .catch(() => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' encountered an error while executing a query to change agent settings to the database.`
      );
      // weasel.error(username, req.ip, "에이전트 설정을 데이터베이스에 변경하는 쿼리 실행 중 오류가 발생하였습니다.");
      res.status(500).send("agent setting post 하다가 에러났어요");
    });
});

router.get("/agents", (req: Request, res: Response) => {
  const username = req.query.username;
  userService
    .getPrivilege(username)
    .then((result1) => {
      settingService
        .getAgentSetting()
        .then((result) => {
          settingService
            .getUpdateFileAgent()
            .then((result2) => {
              if (result1[0].privilege === 3) {
                weasel.log(
                  username,
                  req.ip,
                  `[Warn] The user, '${username}' is an account that does not have access to Agent Settings Menu.`
                );
                // weasel.log(username, req.ip, "에이전트 설정을 이용할 수 없는 계정입니다.");
                res.send([result, result2[0].updateFile, result1]);
              } else {
                weasel.log(
                  username,
                  req.ip,
                  `[Info] The user, '${username}' accessed the Agent Settings Menu.`
                );
                // weasel.log(username, req.ip, "에이전트 설정 메뉴로 이동하였습니다.");
                res.send([result, result2[0].updateFile, result1]);
              }
            })
            .catch((error2) => {
              weasel.error(
                username,
                req.ip,
                `[Error] The user, '${username}' navigating to the Agent Settings Menu failed.`
              );
              // weasel.error(username, req.ip, "에이전트 설정 메뉴로 이동에 실패하였습니다.");
              res.status(500).send("agent setting get 하다가 에러났어요");
            });
        })
        .catch((error) => {
          weasel.error(
            username,
            req.ip,
            `[Error] The user, '${username}' navigating to the Agent Settings Menu failed.`
          );
          // weasel.error(username, req.ip, "에이전트 설정 메뉴로 이동에 실패하였습니다.");
          res.status(500).send("agent setting get 하다가 에러났어요");
        });
    })
    .catch((error) => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' Navigating to the agent settings menu failed.`
      );
      // weasel.error(username, req.ip, "에이전트 설정 메뉴로 이동에 실패하였습니다.");
      res.status(500).send("agent setting get 하다가 에러났어요");
    });
});

router.get("/intervalTime", (req: Request, res: Response) => {
  settingService
    .getIntervalTime()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("intervalTime get 에러");
    });
});

router.get("/process", (req: Request, res: Response) => {
  settingService
    .getProcessAccuracy()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("get process 에러");
    });
});

router.post("/process", (req: Request, res: Response) => {
  const newProcName = req.body.procName;
  const username = req.query.username;

  settingService
    .checkProcessAccuracy(newProcName)
    .then((result) => {
      if (result[0]?.result === 0) {
        settingService
          .addProcessAccuracy(newProcName)
          .then((addResult) => {
            weasel.log(
              username,
              req.ip,
              `[Info] The user, '${username}' added ${newProcName} to the reconnaissance process.`
            );
            // weasel.log(username, req.ip, `${newProcName}을 정탐 프로세스에 추가하였습니다.`);
            res.send(addResult);
          })
          .catch((error: any) => {
            weasel.error(
              username,
              req.ip,
              `[Error] The user, '${username}' adding reconnaissance process ${newProcName} failed.`
            );
            // weasel.error(username, req.ip, "정탐 프로세스 ${newProcName}을 추가에 실패하였습니다.");
            res
              .status(500)
              .send("Add ProcessAccuracy 하다가 에러났어요" + error);
          });
      } else {
        res.send({ result: result[0]?.result });
      }
    })
    .catch((error) => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' encountered an error while running a query to query the database for a new reconnaissance process to add.`
      );
      // weasel.error(username, req.ip, "새로 추가할 정탐 프로세스를 데이터베이스에 조회하는 쿼리 실행 중 오류가 발생하였습니다.");
      res.status(500).send(error);
    });
});

router.post("/delete", (req: Request, res: Response) => {
  const username = req.query.username;
  const procName = req.body.procName;
  settingService
    .deleteProcessAccuracy(procName)
    .then((result) => {
      weasel.log(
        username,
        req.ip,
        `[Info] The user, '${username}' deleted ${procName} from the reconnaissance process.`
      );
      // weasel.log(username, req.ip, `${procName}을 정탐 프로세스에서 삭제하였습니다.`);
      res.send(result);
    })
    .catch((error) => {
      weasel.error(
        username,
        req.ip,
        `[Error] The user, '${username}' failed to delete ProcessAccuracy`
      );
      res.status(500).send("Delete ProcessAccuracy 하다가 에러났어요");
    });
});

router.post(
  "/fileUpdate",
  upload.single("file"),
  (req: Request, res: Response) => {
    let processFile = false;
    if (req.file) {
      const ext = path.extname(req.file.path); // 확장자 추출

      // Dat 파일인 경우
      if (ext === ".dat") {
        // 현재 경로에 이름이 겹치는 파일이 있는 경우
        if (existFile !== "") {
          // 파일 처리 함수를 지연 시간 후에 실행
          const delayTime = 300;

          setTimeout(() => {
            processFile = settingService.processFile(req.file?.path, existFile);
          }, delayTime);
        }
        res.status(200).send("Dat 파일 업로드 성공!");
      } else {
        // Dat 파일이 아닌 경우 파일 삭제
        fs.unlink(req.file.path, (err) => {
          if (err) {
            res.status(500).send("파일 삭제 중 오류 발생");
          } else {
            res.status(200).send("Dat 파일이 아닙니다.");
          }
        });
      }
    } else {
      res.status(200).send("Dat 파일이 아닙니다.");
    }
  }
);

router.get("/updateFile", (req: Request, res: Response) => {
  settingService
    .getUpdateFileAgent()
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("get UpdateAgentFile 하다가 에러났어요");
    });
});

router.post("/updateFile", (req: Request, res: Response) => {
  const username = req.body.username;
  const updateFile = req.body.updateFile.split("\\").pop();

  settingService.getUpdateFileAgent().then((result) => {
    settingService
      .postUpdateFileAgent(result[0].id, updateFile)
      .then(() => {
        weasel.log(
          username,
          req.ip,
          `[Info] The user, '${username}' updated the weasel agent with ${updateFile}.`
        );
        // weasel.log(username, req.ip, `${updateFile}로 weasel 에이전트가 업데이트 되었습니다.`);
        res.send(updateFile);
      })
      .catch(() => {
        weasel.error(
          username,
          req.ip,
          `[Error] The user, '${username}' failed to update the weasel agent with ${updateFile}.`
        );
        // weasel.error(username, req.ip, `${updateFile}로 weasel 에이전트가 업데이트 실패하였습니다.`);
        res.status(500).send("post UpdateAgentFile error");
      });
  });
});

router.get("/outlook", (req: Request, res: Response) => {
  const username = req.query.username;
  settingService
    .getOutlookFlag()
    .then((result) => {
      if ((result[0].flag & 256) === 256) {
        res.send(true);
      } else {
        res.send(false);
      }
    })
    .catch((error) => {
      weasel.error(
        username,
        req.ip,
        "[Error] The user, '${username}' unable to retrieve outlook flag value"
      );
      // weasel.error(username, req.ip, `아웃룩 플래그 값을 이용할 수 없습니다.`);
      res.status(500).send("error");
    });
});

export = router;
