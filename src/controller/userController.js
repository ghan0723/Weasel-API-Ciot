class userController {
  constructor(userService) {
    this.userService = userService;
  }

  async login(req, res) {
    const { username, passwd } = req.body;
    console.log("username(controller) :", username);
    console.log("passwd(controller) :", passwd);

    if (username && passwd) {
      const user = await this.userService.getUserByUsernameAndPasswd(
        username,
        passwd
      );
        console.log("user : ",user);
      if (user && user.passwd === passwd) {
        res.status(200).json({ message: "로그인 성공" });
        res.send(user);
      } else {
        res.status(401).json({ message: "잘못된 사용자명 또는 비밀번호" });
      }
    } else {
      res
        .status(400)
        .json({ message: "사용자명과 비밀번호를 모두 입력하세요" });
    }
  }

  logout(req, res) {
    req.session.destroy();
    res.status(200).json({ message: '로그아웃 성공' });
  }
}

module.exports = userController;
