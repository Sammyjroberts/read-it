/**
 * Created by sammy on 4/9/17.
 */
const express = require('express');
const router  = express.Router();

const articleRoute = require("./articles/articles.route.js");
router.use("/article", articleRoute);

module.exports = router;