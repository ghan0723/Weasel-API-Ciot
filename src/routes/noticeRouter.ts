import NoticeService from "../service/noticeService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const noticeService: NoticeService = new NoticeService();

router.get("/popup", (req: Request, res: Response) => {
  noticeService.getPopNotice().then((result) => {
    res.send(result);
  });
});

export = router;
