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
    .modServerSetting(server)
    .then((result) => {
      weasel.log(username, req.socket.remoteAddress, "Success to Update Server Setting ");
      res.send("업데이트 성공했습니다.");
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to Update Server Setting ");
      console.error("update 에러 : ", error);
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
      weasel.log(username, req.socket.remoteAddress, "Success to Get Server Information ");
      res.send(newResult);
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to Get Server Information ");
      console.error("update get 에러 : ", error);
      res.status(500).send("update get 하다가 에러났어요");
    });
});

router.post("/agent", (req: Request, res: Response) => {
  const username = req.query.username;
  const agent = req.body;
  settingService
    .modAgentSetting(agent)
    .then((result) => {
      weasel.log(username, req.socket.remoteAddress, "Success to Update Agent Setting ");
      res.send(result);
    })
    .catch((error) => {
      // console.error("agent setting post 에러 : ", error);
      weasel.error(username, req.socket.remoteAddress, "Failed to Update Agent Setting ");
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
          weasel.log(username, req.socket.remoteAddress, "Success to Get Agent Information ");
          res.send([result, result2]);
        })
        .catch((error2) => {
          weasel.error(username, req.socket.remoteAddress, "Failed to Get Agent Information ");
          console.error("agent setting get 에러 : ", error2);
          res.status(500).send("agent setting get 하다가 에러났어요");
        });
    })
    .catch((error) => {
      weasel.error(username, req.socket.remoteAddress, "Failed to Get Agent Information ");
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
      weasel.log(username, req.socket.remoteAddress, "Success to Add ProcessAccuracy");
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
      weasel.log(username, req.socket.remoteAddress, "Success to Delete ProcessAccuracy");
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
    if (ext === ".pdf") {
      // 현재 경로에 이름이 겹치는 파일이 있는 경우
      if (existFile !== "") {
        // 파일 처리 함수를 지연 시간 후에 실행
        const delayTime = 300;

        setTimeout(() => {
          processFile = settingService.processFile(req.file?.path, existFile);
        }, delayTime);
      }
      // PDF 파일인 경우
      res.status(200).send("PDF 파일 업로드 성공!");
    } else {
      // PDF 파일이 아닌 경우 파일 삭제
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('파일 삭제 중 오류 발생:', err);
          res.status(500).send('파일 삭제 중 오류 발생');
        } else {
          console.log('PDF 파일이 아닌 파일 삭제됨:', req.file?.path);
          res.status(200).send('PDF 파일이 아닙니다.');
        }
      });
    }
  } else {
    console.log("업로드 실패");
    res.status(400).send("PDF 파일이 아닙니다.");
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

export = router;
