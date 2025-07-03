const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");

// MiddleWares
const { isLoggedIn, saveRedirectUrl, isOwner } = require("../middleware.js");


// Models
const Hotel = require("../models/hotel");
const Location = require("../models/location");
const Employee = require("../models/employee");

// Handle Image Upload
const multer  = require('multer');
const { storage, uploadQRCodeToCloudinary } = require('../cloudConfig');
const upload = multer({ storage });

// Fetch Employees detail on showHotel page
const fetchEmployeesForHotel = async (req, res, next) => {
    try {
        if (req.params.id) { // Hotel ID
            const employees = await Employee.find({ 
                hotelID: req.params.id,
                managerID: req.user._id 
            });
            res.locals.employees = employees || [];
        }
        next();
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.locals.employees = [];
        next();
    }
};


// Add New Employee
router.post('/', upload.single('photo'),isLoggedIn, wrapAsync(async (req, res) => {
    const managerID = req.user._id;
    const { username, email, phone, role, upiID, password, hotelID } = req.body;
        
    try {
        // Check if hotel exists
        const hotel = await Hotel.findById(hotelID);
        if (!hotel) {
            req.flash('error', 'Hotel not found');
            return res.redirect('/hotel');
        }
        
        // Create new employee
        const newEmployee = new Employee({
            username,
            email,
            phone,
            role,
            upiID: upiID || null,
            photo: req.file ? {
                url: req.file.path,
                filename: req.file.filename
            } : null,
            isActive: true ,
            hotelID: hotelID,
            managerID: managerID, 
        });
        
        // Register employee with password (assuming you use passport-local-mongoose)
        const registeredEmployee = await Employee.register(newEmployee, password);
        
        req.flash('success', `Employee ${username} added successfully!`);
        res.redirect(`/hotel/${hotelID}`);
        
    } catch (error) {
        console.error("Error adding employee:", error.message);
        req.flash('error', 'Failed to add employee. Please try again.');
        res.redirect(`/hotel/${hotelID}`);
    }
}));




// // Edit employee form
// router.get('/:id/edit', wrapAsync(async (req, res) => {
//     const { id } = req.params;
    
//     try {
//         const employee = await Employee.findById(id).populate('hotelId');
        
//         if (!employee) {
//             req.flash('error', 'Employee not found');
//             return res.redirect('/hotel');
//         }
        
//         res.render('listings/', { employee });
        
//     } catch (error) {
//         console.error("Error fetching employee for edit:", error.message);
//         req.flash('error', 'Failed to load employee');
//         res.redirect('/hotel');
//     }
// }));

// Update employee
router.put('/:id', upload.single('photo'), isLoggedIn,wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { username, email, phone, role, upiID, isActive  } = req.body;
    
    try {
        const updateData = {
            username,
            email,
            phone,
            role,
            upiID: upiID || null, 
            isActive: isActive === 'true'
        };
        
        // Add photo if uploaded
        if (req.file) {
            updateData.photo = {
                url: req.file.path,
                filename: req.file.filename
            };
        }
        
        const employee = await Employee.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!employee) {
            req.flash('error', 'Employee not found');
            return res.redirect('/hotel');
        }
        
        req.flash('success', 'Employee updated successfully!');
        res.redirect(`/employee/${id}`);
        
    } catch (error) {
        console.error("Error updating employee:", error.message);
        req.flash('error', 'Failed to update employee');
        res.redirect(`/employee/${id}/edit`);
    }
}));

// Delete employee
router.delete('/:id',isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    
    try {
        const employee = await Employee.findByIdAndDelete(id);
        
        if (!employee) {
            req.flash('error', 'Employee not found');
            return res.redirect('/hotel');
        }
        
        // Store hotelID before deletion
        const hotel = employee.hotelID;
        
        // delete the employee
        await Employee.findByIdAndDelete(id);

        req.flash('success', 'Employee deleted successfully!');
        res.redirect(`/hotel/${hotel._id}`);
        
    } catch (error) {
        console.error("Error deleting employee:", error.message);
        req.flash('error', 'Failed to delete employee');
        res.redirect('/hotel');
    }
}));


// Get employee details
router.get('/:id',isLoggedIn, wrapAsync(async (req, res) => {
    const { id } = req.params;
    
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

        if (!employee) {
            req.flash('error', 'Employee not found');
            return res.redirect('/hotel');
        }
        
        res.render('listings/showEmployee.ejs', { employee });
        
    } catch (error) {
        console.error("Error fetching employee:", error.message);
        req.flash('error', 'Failed to load employee details');
        res.redirect('/hotel');
    }
}));


module.exports = router; 
module.exports.fetchEmployeesForHotel = fetchEmployeesForHotel;

