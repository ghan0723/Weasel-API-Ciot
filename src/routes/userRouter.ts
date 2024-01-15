import express, { Request, Response, Router } from "express";
import UserService from "../service/userService";
import connection from "../db/db";

const router: Router = express.Router();
const userService: UserService = new UserService(connection);

router.post("/login", (req: Request, res: Response) => {
  const { username, passwd }: { username: string; passwd: string } = req.body;

  userService
    .getLogin(username, passwd)
    .then((user) => {
      console.log("user(여긴 라우터) :", user);
      if (user.length === 0) {
        // 에러 메시지와 원하는 URL을 포함한 JSON 응답을 보냄
        res.status(401).json({
          error: "사용자를 찾을 수 없습니다",
          redirectUrl: "http://localhost:3000/auth/sign-in",
        });
        return;
      }
      res.cookie("username", user[0].username, {
        maxAge: 60 * 60 * 1000,
        path: "/", // 쿠키의 경로 설정
      });
      res.status(200).send("로그인 성공");
    })
    .catch((error) => {
      res.status(500).send("서버 내부 오류가 발생했습니다.");
    });
});

router.get("/all", (req: Request, res: Response) => {
  let username = req.query.username;
  console.log("grade 확인점 : ", username);
  userService
    .getGradeAndMngip(username)
    .then((result) => {
      console.log("result(grade랑 ip 들어있음) 생긴거 보여줘 : ", result);
      userService.getUserList(result[0].grade)
      .then((result2) => {
        console.log("list를 잘 가져왔는가 ? : ", result2);
        res.status(200).send(result2);
      })
      .catch((error2) => {
        console.error("list를 제대로 못 가져옴:", error2);
        res.status(500).send("Internal Server Error");
      });
    })
    .catch((error) => {
      console.error("user 정보 제대로 못 가져옴:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/add", (req: Request, res: Response) => {
  const user = req.body;
  userService
    .addUser(user)
    .then((result) => {
      res.redirect("http://localhost:3000/users/control");
    })
    .catch((error) => {
      console.error("회원가입 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/rm", (req: Request, res: Response) => {
  let users = req.body;
  console.log("삭제할 유저 배열 확인 : ", users);
  userService
    .removeUser(users)
    .then((result) => {
      userService
        .getUserList(1)
        .then((result2) => {
          res.send(result2);
        })
        .catch((error2) => {
          console.error("유저 불러 오다가 실패:", error2);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((error) => {
      console.error("실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/modify/:username", (req: Request, res: Response) => {
  let username = req.params.username;
  console.log("username이 잘 왔니? : ", username);
  userService
    .getUser(username)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      console.error("보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.post("/update/:username", (req: Request, res: Response) => {
  let oldname = req.params.username;
  let user = req.body;
  console.log("변경하고자 하는 유저 : ", oldname);
  console.log("변경 정보 : ", user);
  userService
    .modUser(user, oldname)
    .then((result) => {
      res.redirect("http://localhost:3000/users/control");
    })
    .catch((error) => {
      console.error("업데이트 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/namecookie", (req: Request, res: Response) => {
  let username = req.cookies.username;
  res.json({ username: username });
});

router.get("/grade/:username", (req: Request, res: Response) => {
  let username = req.params.username;
  userService
    .getGrade(username)
    .then((result) => {
      console.log("grade 값 체크 좀:", result);
      res.send(result);
    })
    .catch((error) => {
      console.error("grade 보내기 실패:", error);
      res.status(500).send("Internal Server Error");
    });
});

export = router;
