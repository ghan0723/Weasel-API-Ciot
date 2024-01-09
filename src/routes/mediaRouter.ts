import MediaService from "../service/mediaService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const mediaService: MediaService = new MediaService();

router.get("/all/:select", (req: Request, res: Response) => {
  let select = req.params.select;
  mediaService
    .getMediaAll(select)
    .then((allmedias) => {
      res.send(allmedias);
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      res.status(500).send("Internal Server Error");
    });
});

export = router;