import { NextFunction, Request, Response } from "express";

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req:Request, res:Response, next:NextFunction) {
  res.status(200).send('users');
});

module.exports = router;
