import MediaService from "../service/mediaService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const mediaService: MediaService = new MediaService();

router.get("/all", (req: Request, res: Response) => {
  mediaService
    .getMediaAll()
    .then((allmedias) => {
      res.send(allmedias);
    })
    .catch((error) => {
      console.error("에러 발생:", error);
      res.status(500).send("Internal Server Error");
    });
});

export = router;