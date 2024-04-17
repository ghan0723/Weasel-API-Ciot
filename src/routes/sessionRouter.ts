import SessionService from "../service/sessionService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const sessionService: SessionService = new SessionService();

router.post("/delete", (req: Request, res: Response) => {
  const {sessionName} = req.body;

  sessionService.deleteSession(sessionName)
  .then(() => res.send('success'))
  .catch((error) => res.status(500).send(error))
});

router.get("/all", (req: Request, res: Response) => {
  let category = req.query.category;
  let searchWord = req.query.searchWord;

  sessionService
    .getSessionList(category, searchWord)
    .then((sessionList) => {

      if (sessionList.length > 0) {
        res.status(200).send(sessionList);
      } else {
        res.status(200).send([{
            s_id: "",
            s_name: "",
            p_name: "",
            username: "",
            s_time: "",
          },]);
      }
    })
    .catch((sessionListError) => {
      //검색이나 무언가 잘못되었을 때 기본 리스트를 넘겨준다.
      res.status(500).send([{
          s_id: "",
          s_name: "",
          p_name: "",
          username: "",
          s_time: "",
        },]);
    });
});

router.get("/data", (req: Request, res: Response) => {
  const {sessionname, policyname} = req.query;

  sessionService.getSessionData(sessionname,policyname)
  .then(result => {
    // return res.send(result)
  })
  .catch(error => res.status(500).send(error));
  

});

router.get('/start', (req:Request, res:Response) => {
    const {username, policyname} = req.query;

    sessionService.getInsertSessions(username,policyname)
    .then(result => {
        res.send(result);
    })
    .catch((error) => {
        res.status(500).send(error);
    });
});

export = router;
