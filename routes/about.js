const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");


router.get("/manager/about",wrapAsync(async(req,res) => {
    res.render("listings/managerAbout.ejs");
}));

router.get("/employees/about",wrapAsync(async(req,res) => {
    res.render("listings/employeeAbout.ejs");
}));

router.get("/customer/about",wrapAsync(async(req,res) => {
    res.render("listings/customerAbout.ejs");
}));

module.exports = router;
