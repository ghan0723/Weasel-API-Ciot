"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const profileService_1 = __importDefault(require("../service/profileService"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const profileService = new profileService_1.default();
router.get('/edit/:username', (req, res) => {
    let username = req.params.username;
    profileService.getProfile(username)
        .then((user) => {
        res.send(user);
    })
        .catch((error) => {
        console.error('profile failed:', error);
        res.status(500).send('Internal Server Error');
    });
});
module.exports = router;
