const express = require("express");
const router = express.Router();
const Manager = require("../models/manager.js");
const Employee = require("../models/employee.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const bcrypt = require('bcrypt');

//MiddleWare
const { isLoggedIn, isLoggedInEmployee, saveRedirectUrl, isOwner } = require("../middleware.js");


// Handle Image Upload
const multer  = require('multer');
const { storage, uploadQRCodeToCloudinary } = require('../cloudConfig');
const upload = multer({ storage });



// Login form
router.get("/login",(req,res) => {
    res.render("users/employeeLogin.ejs");
});

// Login route
router.post("/login" ,
    saveRedirectUrl,
    passport.authenticate("employee-local" , {failureRedirect:'/employeeAccount/login' , failureFlash: true}) ,
    async(req,res) => {
    
        req.flash(`success` , `Welcome back!`);
        let redirectUrl = res.locals.redirectUrl || "/employeeAccount";
        res.redirect(redirectUrl);
     
    });

router.get("/logout",(req,res,next) => {
    req.logOut((err) => {
        if(err){
            next(err);
        }
    req.flash("success" ,"You are logged out!" );
    res.redirect('/employeeAccount/login');
    })
});





// Get employee details
router.get('/',isLoggedInEmployee, wrapAsync(async (req, res) => {
    const { id } = req.user;
    
    try {
        // const employee = await Employee.findById(id).populate('hotelID');
        const employee = await Employee.findById(id)
            .populate({
                path: 'hotelID',
                populate: {
                    path: 'locationID',
                }
            })
            .populate('managerID');

        
        res.render('listings/employeeDashboard.ejs', { employee });
        
    } catch (error) {
        console.error("Error fetching employee:", error.message);
        req.flash('error', 'Failed to load employee details');
        res.redirect('/employeeAccount/login');
    }
}));




// Update employee (backend) 
router.put('/updateDetails', upload.single('photo'), isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.user;
    const { email, phone, upiID, password } = req.body;
    
    try {
        // Find the employee
        const employee = await Employee.findById(id);
        
        if (!employee) {
            req.flash('error', 'Employee not found');
            return res.redirect('/employeeAccount');
        }
        
        // Update basic fields
        employee.email = email;
        employee.phone = phone;
        employee.upiID = upiID || null;
        
        // Add photo if uploaded
        if (req.file) {
            employee.photo = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        
        // Update password if provided
        if (password && password.trim() !== '') {
            await employee.setPassword(password);
            req.flash('success', 'Profile and password updated successfully!');
        } else {
            req.flash('success', 'Profile updated successfully!');
        }
        
        // Save all changes
        await employee.save();
        
        res.redirect('/employeeAccount');
        
    } catch (error) {
        console.error("Error updating employee:", error.message);
        req.flash('error', 'Failed to update employee details');
        res.redirect('/employeeAccount');
    }
}));

module.exports = router;
