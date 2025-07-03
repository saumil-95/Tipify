const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");


// Routes
const Manager = require("../models/manager.js");
const Hotel = require("../models/hotel.js");
const Location = require("../models/location");

//MiddleWare
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");


// Handle Image Upload
const { storage } = require("../cloudConfig.js");
const multer = require('multer');
const upload = multer({ storage });





// SignUp form
router.get("/signup",(req,res) => {
    res.render("users/managerSignup.ejs");
});

// Add SignUp data
router.post('/signup', wrapAsync(async (req, res, next) => {
      try {
        const { username, email, phone, password } = req.body;
        
        // // const { country, state, city, area, zipCode, latitude, longitude } = newLocation;

        // // Create a new location entry
        // const newLocationEntry = new Location({
        //   country,
        //   state,
        //   city,
        //   area,
        //   zipCode,
        //   latitude,
        //   longitude,
        //   type: "user",

        // });
  
        // const savedLocation = await newLocationEntry.save();
        // Create a new Manager instance
        const newManager = new Manager({
          username,
          email,
          phone,
        });
  

        
        // Register the user and hash the password
        const registeredManager = await Manager.register(newManager, password);
  
        console.log(registeredManager);
  
        // Automatically log the user in after signup
        req.login(registeredManager, (err) => {
          if (err) return next(err);
  
          // Redirect to products page after successful signup
          res.redirect('/hotel');
        });
      } catch (err) {
        console.error(err);
  
        // Handle errors gracefully and redirect to signup page
        res.redirect('/signup');
      }
    }));


    

// Login form
router.get("/login",(req,res) => {
    res.render("users/managerLogin.ejs");
});



router.post("/login" ,
    saveRedirectUrl,
    passport.authenticate("local" , {failureRedirect:'/login' , failureFlash: true}) ,
    async(req,res) => {
    
        req.flash(`success` , `Welcome back!`);
        let redirectUrl = res.locals.redirectUrl || "/hotel";
        res.redirect(redirectUrl);
     
    });

router.get("/logout",(req,res,next) => {
    req.logOut((err) => {
        if(err){
            next(err);
        }
    req.flash("success" ,"You are logged out!" );
    res.redirect("/login");
    })
});



// Get manager details
// router.get('/manager/:id',isLoggedIn, wrapAsync(async (req, res) => {
//   const { id } = req.user;
  
//   try {
//        // Fetch the manager details
//     const manager = await Manager.findById(id);

//     if (!manager) {
//       req.flash('error', 'Manager not found');
//       return res.redirect('/login');
//     }

//     // Fetch the related hotel and location details
//     const hotel = await Hotel.findOne({ managerID: id }).populate('locationID');

//     res.render('listings/showManager.ejs', { manager, hotel });
      
//   } catch (error) {
//       console.error("Error fetching employee:", error.message);
//       req.flash('error', 'Failed to load manager details');
//       res.redirect('/login');
//   }
// }));

router.get('/manager/profile',isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.user;
  
  try {
       // Fetch the manager details
    const manager = await Manager.findById(id);

    if (!manager) {
      req.flash('error', 'Manager not found');
      return res.redirect('/login');
    }

    // Fetch the related hotel and location details
    const hotel = await Hotel.findOne({ managerID: id }).populate('locationID');

    res.render('listings/showManager.ejs', { manager, hotel });
      
  } catch (error) {
      console.error("Error fetching employee:", error.message);
      req.flash('error', 'Failed to load manager details');
      res.redirect('/login');
  }
}));


// Update manager (backend) - Alternative approach
router.put('/manager/:id',  isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const { username, email, phone, password } = req.body;
  
  try {
      // Find the manager
      const manager = await Manager.findById(id);
      
      if (!manager) {
          req.flash('error', 'Manager not found');
          return res.redirect('/login');
      }
      
      // Update basic fields
      manager.username = username;
      manager.email = email;
      manager.phone = phone;
      
    
      
      // Update password if provided
      if (password && password.trim() !== '') {
          await manager.setPassword(password);
          req.flash('success', 'Profile and password updated successfully!');
      } else {
          req.flash('success', 'Profile updated successfully!');
      }
      
      // Save all changes
      await manager.save();
      
      res.redirect(`/manager/profile`);
      
  } catch (error) {
      console.error("Error updating manager:", error.message);
      req.flash('error', 'Failed to update manager details');
      res.redirect(`/manager/${id}`);
  }
}));

//  DELETE route - Delete Manager Only
router.delete('/manager/:id', isLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  
  try {
      await Manager.findByIdAndDelete(id);
      req.flash('success', 'Profile deleted successfully');
      res.redirect('/signup');
  } catch (error) {
      console.error("Error deleting manager:", error.message);
      req.flash('error', 'Failed to delete profile');
      res.redirect(`/manager/${id}`);
  }
}));

module.exports = router;
