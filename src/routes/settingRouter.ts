import multer from "multer";
import { weasel } from "../interface/log";
import SettingService from "../service/settingService";
import path from "path";
import fs from "fs";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const settingService: SettingService = new SettingService();
let existFile: string = "";
// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "C:/ciot/updates/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // 확장자 추출
    let filename = path.basename(file.originalname, ext) + ext;
    const fullPath = path.join("C:/ciot/updates/", filename);
    existFile = "";

    if (fs.existsSync(fullPath)) {
      existFile = path.join("C:/ciot/updates/", filename);
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

router.post("/server", (req: Request, res: Response) => {
  const username = req.query.username;
  const server = req.body;
  settingService
  .getServerSetting()
  .then((result) => {
    const str = settingService.modServerSettingLog(server,result[0]);
    settingService.modServerSetting(server)
    .then(() => {
      weasel.log(username, req.socket.remoteAddress, str);
      res.send("업데이트 성공했습니다.");
    }).catch(() => {
      // weasel.error(username, req.socket.remoteAddress, '서버 세팅 정보 얻기 실패');
      weasel.error(username, req.socket.remoteAddress, 'Failed to get server settings information');

      res.status(500).send("update 하다가 에러났어요");
    });
  }
  )
    .catch(() => {
      // weasel.error(username, req.socket.remoteAddress, '서버 정보 업데이트 실패');
      weasel.error(username, req.socket.remoteAddress, 'Failed to update server information');
      
      res.status(500).send("update 하다가 에러났어요");
    });
});

router.get("/servers", (req: Request, res: Response) => {
  const username = req.query.username;
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
      };
      weasel.log(username, req.socket.remoteAddress, "You have been directed to the Server Settings menu.");
      // weasel.log(username, req.socket.remoteAddress, "서버 설정 메뉴로 이동하였습니다.");
      res.send(newResult);
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, 'Failed to get server settings information');
      // weasel.error(username, req.socket.remoteAddress, '서버 세팅 정보 얻기 실패');
      console.error("update get 에러 : ", error);
      res.status(500).send("update get 하다가 에러났어요");
    });
});

router.post("/agent", (req: Request, res: Response) => {
  const username = req.query.username;
  const agent = req.body;
  settingService
    .getAgentSetting()
    .then(result => {      
      const str = settingService.modAgentSettingLog(agent,result[0]);
      settingService.modAgentSetting(agent)
      .then((result) => {
        weasel.log(username, req.socket.remoteAddress, str);
        res.send(result);
      }).catch(() => {
        weasel.error(username, req.socket.remoteAddress, "Failed to get agent settings information ");
        // weasel.error(username, req.socket.remoteAddress, "에이전트 세팅 정보 얻기 실패 ");
        res.status(500).send("agent setting post 하다가 에러났어요");
      });
    })
    .catch(() => {
      weasel.error(username, req.socket.remoteAddress, "Failed to update agent information ");
      // weasel.error(username, req.socket.remoteAddress, "에이전트 정보 업데이트 실패 ");
      res.status(500).send("agent setting post 하다가 에러났어요");
    });
});

router.get("/agents", (req: Request, res: Response) => {
  const username = req.query.username;
  settingService
    .getAgentSetting()
    .then((result) => {
      settingService
        .getUpdateFileAgent()
        .then((result2) => {
          weasel.log(username, req.socket.remoteAddress, "You're in the Agent settings menu.");
          // weasel.log(username, req.socket.remoteAddress, "에이전트 설정 메뉴로 이동하였습니다.");
          res.send([result, result2]);
        })
        .catch((error2) => {
          weasel.error(username, req.socket.remoteAddress, "Failed to get agent settings information ");
          // weasel.error(username, req.socket.remoteAddress, "에이전트 세팅 정보 얻기 실패 ");
          console.error("agent setting get 에러 : ", error2);
          res.status(500).send("agent setting get 하다가 에러났어요");
        });
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to get agent settings information ");
      // weasel.error(username, req.socket.remoteAddress, "에이전트 세팅 정보 얻기 실패 ");
      console.error("agent setting get 에러 : ", error);
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
      console.error("intervalTime get 에러 : ", error);
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
      console.error("get process 에러 : ", error);
      res.status(500).send("get process 에러");
    });
});

router.post("/process", (req: Request, res: Response) => {
  const newProcName = req.body.procName;
  const username = req.query.username;
  settingService
    .addProcessAccuracy(newProcName)
    .then((result) => {
      weasel.log(username, req.socket.remoteAddress, `Added ${newProcName} to the reconnaissance process.`);
      // weasel.log(username, req.socket.remoteAddress, `${newProcName}을 정탐 프로세스에 추가하였습니다.`);
      res.send(result);
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to Add ProcessAccuracy");
      res.status(500).send("Add ProcessAccuracy 하다가 에러났어요");
    });
});

router.post("/delete", (req: Request, res: Response) => {
  const username = req.query.username;
  const procName = req.body.procName;
  settingService
    .deleteProcessAccuracy(procName)
    .then((result) => {
      weasel.log(username, req.socket.remoteAddress, `Deleted ${procName} from the reconnaissance process.`);
      // weasel.log(username, req.socket.remoteAddress, `${procName}을 정탐 프로세스에서 삭제하였습니다.`);
      res.send(result);
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to Delete ProcessAccuracy");
      res.status(500).send("Delete ProcessAccuracy 하다가 에러났어요");
    });
});

router.post("/fileUpdate", upload.single("file"), (req: Request, res: Response) => {
  let processFile = false;
  if (req.file) {
    const ext = path.extname(req.file.path); // 확장자 추출
    if (ext === ".dat") {
      // 현재 경로에 이름이 겹치는 파일이 있는 경우
      if (existFile !== "") {
        // 파일 처리 함수를 지연 시간 후에 실행
        const delayTime = 300;

        setTimeout(() => {
          processFile = settingService.processFile(req.file?.path, existFile);
        }, delayTime);
      }
      // Dat 파일인 경우
      res.status(200).send("Dat 파일 업로드 성공!");
    } else {
      // Dat 파일이 아닌 경우 파일 삭제
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('파일 삭제 중 오류 발생:', err);
          res.status(500).send('파일 삭제 중 오류 발생');
        } else {
          res.status(200).send('Dat 파일이 아닙니다.');
        }
      });
    }
  } else {
    res.status(400).send("Dat 파일이 아닙니다.");
  }
});

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
  const updateFile = req.body.updateFile.split('\\').pop();

  settingService
    .postUpdateFileAgent(updateFile)
    .then(() => {
      res.send(updateFile);
    })
    .catch(() => {
      res.status(500).send("post UpdateAgentFile error");
    });
});

router.get("/outlook", (req: Request, res: Response) => {
  const username = req.query.username;
  settingService.getOutlookFlag()
  .then((result) => {
    if((result[0].flag & 256) === 256){
      res.send(true);
    } else {
      res.send(false);
    }
  })
  .catch((error) => {
    weasel.error(
      username,
      req.socket.remoteAddress,
      "Unable to retrieve outlook flag value"
    );
    res.status(500).send("error");
  })
})

export = router;
