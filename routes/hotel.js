const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
// const QRCode = require('qrcode');
const qr = require("qr-image");


// MiddleWares
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");

const { fetchEmployeesForHotel } = require('./employee')

// Models
const Hotel = require("../models/hotel");
const Location = require("../models/location");
const Employee = require("../models/employee");
const Manager = require("../models/manager");

// Handle Image Upload
const multer  = require('multer');
const { storage, uploadQRCodeToCloudinary } = require('../cloudConfig');
const upload = multer({ storage });





router.get("/", isLoggedIn, wrapAsync(async(req, res) => {
    try {
        const managerID = req.user._id; 

         // Fetch all hotels for the logged-in manager
        const hotels = await Hotel.find({ managerID }).populate('locationID').populate('managerID');

        // Fetch manager details
        const manager = await Manager.findById(managerID);

        // Count hotels for this manager
        const hotelCount = hotels.length;


         // Predefined array of image URLs (use real image URLs for production)
         const hotelImages = [
            "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
           
            "https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/258190/pexels-photo-258190.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/1438834/pexels-photo-1438834.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800"
        ];


        res.render("listings/allHotel.ejs", { hotels, hotelImages, manager, hotelCount  });
      } catch (error) {
        console.error("Error fetching hotels:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch hotels." });
      }
}));




router.get('/myHotel', isLoggedIn, async (req, res) => {
    try {
        const managerId = req.user._id; // Assuming `req.user` contains the logged-in user's details

        // Find the first hotel associated with the manager
        const firstHotel = await Hotel.findOne({ managerID: managerId }).sort({ createdAt: 1 });

        if (!firstHotel) {
            return res.status(404).send('No hotels found associated with this manager.');
        }

        // Redirect to the hotel's page
        res.redirect(`/hotel/${firstHotel._id}`);
    } catch (error) {
        console.error('Error fetching the first hotel for the manager:', error.message);
        res.status(500).send('Unable to fetch the hotel. Please try again later.');
    }
});



router.get("/newHotel", isLoggedIn,wrapAsync(async(req,res) => {
    res.render("listings/newHotel.ejs");
}));
 

// Add a new hotel
router.post(
    '/',
    upload.single('file'), isLoggedIn,
    wrapAsync(async (req, res) => {
      const { name,description, city, state, address, zipCode, latitude, longitude } = req.body;
      const managerID = req.user._id;

      try {
        // Save location in the Location collection
        const location = new Location({
          city,
          state,
          address,
          zipCode,
          latitude,
          longitude,
        });
        const savedLocation = await location.save();
  
        // Generate a useful link for the QR code
        // const qrData = `http://example.com/hotel/${savedLocation._id}`; 
        // const qrData = `http://localhost:3000/hotel/${savedLocation._id}`;
        const qrData = `http://localhost:3000/hotel/tip/${savedLocation._id}`;


        const qrFilename = `${name.replace(/\s+/g, '_')}_qrcode`;
  
        // Upload QR code to Cloudinary
        const result = await uploadQRCodeToCloudinary(qrData, qrFilename);
  
        // Save hotel in the Hotel collection
        const hotel = new Hotel({
          name,
          description,
          qrCode: {
            url: result.secure_url, // Cloudinary secure URL
            filename: result.public_id, // Cloudinary public ID
          },
          locationID: savedLocation._id,
          managerID: managerID, 
        });
        await hotel.save();
  
        res.redirect('/hotel');
      } catch (error) {
        console.error('Error adding hotel:', error.message);
        res.status(500).send('Failed to add hotel. Please try again later.');
      }
    })
  );






// Search Route in showHotel Page
router.get("/:id/search", isLoggedIn, fetchEmployeesForHotel, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { query } = req.query;

    try {
        const hotel = await Hotel.findById(id).populate('locationID');

        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        // Filter employees based on the search query
        let employees = res.locals.employees;
        if (query) {
            const regex = new RegExp(query, 'i'); // Case-insensitive search
            employees = employees.filter(employee => 
                regex.test(employee.username) || regex.test(employee.role)
            );
        }
        // const employeeCount = employees.length;
        const employeeCount = await Employee.countDocuments({ hotelID: id });

        res.render('listings/showHotel.ejs', { hotel, employees, query,employeeCount });
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).send('Failed to fetch search results. Please try again later.');
    }
}));





// Search Route for TipList page
router.get("/tip/:locationId/search", fetchEmployeesForHotel, wrapAsync(async (req, res) => {
    const { locationId } = req.params; // Extract locationId from params
    const { query } = req.query; // Extract search query

    try {
        // Find the hotel based on locationID
        const hotel = await Hotel.findOne({ locationID: locationId }).populate('locationID');

        if (!hotel) {
            return res.status(404).send('Hotel not found.');
        }

        // Fetch employees linked to the hotel
        let employees = await Employee.find({ hotelID: hotel._id });

        // Filter employees based on search query (if provided)
        if (query) {
            const regex = new RegExp(query, 'i'); // Case-insensitive search
            employees = employees.filter(employee => 
                regex.test(employee.username) || regex.test(employee.role)
            );
        }

        // Render the results
        res.render('listings/tipList.ejs', { hotel, employees, query });
    } catch (error) {
        console.error('Error fetching search results:', error.message);
        res.status(500).send('Failed to fetch search results. Please try again later.');
    }
}));



  // Update hotel - Show edit form
router.get('/:id/edit',isLoggedIn, wrapAsync(async (req, res) => {

    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate('locationID');
    if (!hotel) {
        return res.status(404).send('Hotel not found');
    }
    res.render('listings/editHotel', { hotel }); 
}));

// Update hotel - Process update
router.put('/:id',isLoggedIn, wrapAsync(async (req, res) => {

    const { id } = req.params;
    const { name,description, city, state, address, zipCode, latitude, longitude } = req.body;
    description
    try {
        // Update location details
        const hotel = await Hotel.findById(id).populate('locationID');
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }
        const location = await Location.findByIdAndUpdate(hotel.locationID._id, {
            city,
            state,
            address,
            zipCode,
            latitude,
            longitude,
        }, { new: true });

        // Optionally update the QR code if data changes
        const qrData = `http://localhost:3000/hotel/tip/${location._id}`;

        // const qrData = `http://example.com/hotels/${hotel._id}`; // Ensure this matches your QR code logic
        const qrFilename = `${name.replace(/\s+/g, "_")}_qrcode.png`;
        const qrPath = `public/qrcodes/${qrFilename}`;
        require("fs").writeFileSync(qrPath, qr.imageSync(qrData, { type: "png" }));

        // Update hotel details
        hotel.name = name;
        hotel.description = description;
        hotel.qrCode = {
            url: `/qrcodes/${qrFilename}`,
            filename: qrFilename,
        };
        await hotel.save();

        res.redirect(`/hotel/${hotel._id}`);
    } catch (error) {
        console.error("Error updating hotel:", error.message);
        res.status(500).send("Failed to update hotel. Please try again later.");
    }
}));


// Delete hotel
router.delete('/:id',isLoggedIn, wrapAsync(async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        // Delete associated location
        await Location.findByIdAndDelete(hotel.locationID);

        // Delete QR code file
        const fs = require('fs');
        const qrPath = `public${hotel.qrCode.url}`;
        if (fs.existsSync(qrPath)) {
            fs.unlinkSync(qrPath);
        }

        // Delete hotel
        await Hotel.findByIdAndDelete(req.params.id);

        res.redirect('/hotel');
    } catch (error) {
        console.error("Error deleting hotel:", error.message);
        res.status(500).send("Failed to delete hotel. Please try again later.");
    }
}));

// Show hotel in detail
router.get("/:id",isLoggedIn,fetchEmployeesForHotel, wrapAsync(async (req, res) => {
    const { id } = req.params;
    try {
        const hotel = await Hotel.findById(id).populate('locationID');

        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        // Count the employees associated with this hotel
        const employeeCount = await Employee.countDocuments({ hotelID: id });

        res.render('listings/showHotel.ejs', { hotel, employees: res.locals.employees,employeeCount, query: ''  }); // Render hotel detail page
    } catch (error) {
        console.error('Error fetching hotel details:', error.message);
        res.status(500).send('Failed to fetch hotel details. Please try again later.');
    }
}));



// router.get('/:locationId', async (req, res) => {
//     const { locationId } = req.params;

//     try {
//         const hotel = await Hotel.findOne({ locationID: locationId }).populate('locationID');
//         const employees = await Employee.find({ hotelID: hotel._id });

//         res.render('listings/tipList.ejs', { hotel, employees });
//     } catch (error) {
//         console.error('Error fetching hotel or employees:', error.message);
//         res.status(500).send('Error loading employees.');
//     }
// });

//Scan the QR code and this route will display employee list
router.get('/tip/:locationId', async (req, res) => {
    const { locationId } = req.params;

    try {
        // Find the hotel by locationId
        const hotel = await Hotel.findOne({ locationID: locationId }).populate('locationID');
        if (!hotel) {
            return res.status(404).send('Hotel not found');
        }

        // Find employees linked to the hotel
        const employees = await Employee.find({ hotelID: hotel._id });

        // Render the tip list view
        res.render('listings/tipList.ejs', { hotel, employees,query:'' });
    } catch (error) {
        console.error('Error fetching hotel or employees:', error.message);
        res.status(500).send('Error loading employees.');
    }
});








// router.get('/tip/:locationId/team', isLoggedIn, async (req, res) => {
//     try {
//         // Fetch the relevant hotel
//         const hotel = await Hotel.findOne({ locationID: req.user.locationID });

//         if (!hotel) {
//             return res.status(404).send('Hotel not found.');
//         }

//         // Pass the hotel ID to the template
//         res.render('layouts/customerBoilerplate.ejs', { hotelId: hotel._id });
//     } catch (error) {
//         console.error('Error fetching hotel:', error.message);
//         res.status(500).send('Unable to fetch hotel. Please try again later.');
//     }
// });



module.exports = router;
