import ProfileService from '../service/profileService';
import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();
const profileService: ProfileService = new ProfileService();

router.get('/edit/:username', (req:Request, res:Response) => {
    let username = req.params.username;

    profileService.getProfile(username)
    .then((user) => {
        res.send(user);
    })
    .catch((error) => {
        console.error('profile failed:', error);
        res.status(500).send('Internal Server Error');
    })
})

export = router;