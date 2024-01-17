import UserService from "../service/userService";
import ProfileService from "../service/profileService";
import express, { Request, Response, Router } from "express";

const router: Router = express.Router();
const profileService: ProfileService = new ProfileService();
const userService: UserService = new UserService();

router.get("/edit/:username", (req: Request, res: Response) => {
  let username = req.params.username;

  profileService
    .getProfile(username)
    .then((user) => {
      res.send(user);
    })
    .catch((error) => {
      console.error("profile failed:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/update/:username", (req: Request, res: Response) => {
  let oldname = req.params.username;
  let user = req.body;
  userService.checkUsername(user.username, oldname).then((result) => {
    if (result.exists) {
      res.status(401).send({ error: result.message });
    } else {
      profileService
        .modUser(user, oldname)
        .then((result2) => {
          res.send(result2.message);
        })
        .catch((error) => {
          res.status(500).send("업데이트 잘못된거 같습니다.");
        });
    }
  });
});

export = router;
