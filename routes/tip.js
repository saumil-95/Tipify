const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const wrapAsync = require("../utils/wrapAsync.js");
const bodyParser = require("body-parser");
// Stripe payment
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace with your Secret Key



// MiddleWares
const { isLoggedIn, saveRedirectUrl, isOwner, isLoggedInEmployee } = require("../middleware.js");



// Models
const Manager = require("../models/manager.js");
const Hotel = require("../models/hotel.js");
const Location = require("../models/location");
const Employee = require("../models/employee");
const Tip = require('../models/tip');


router.post("/process-tip", async (req, res) => {
    const { employeeId, hotelId, amount, paymentMethod, upiApp, stripePaymentMethodId } = req.body;

    try {
        console.log("Processing tip request...");
        console.log("Full request body:", req.body);
        console.log(`Received data: employeeId=${employeeId}, hotelId=${hotelId}, amount=${amount}, paymentMethod=${paymentMethod}, upiApp=${upiApp}, stripePaymentMethodId=${stripePaymentMethodId}`);

        // Enforce minimum amount for payments based on payment method
        if (paymentMethod === "stripe_card" && amount < 50) {
            console.log("Error: Amount is below Stripe's minimum threshold.");
            return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Minimum%20amount%20for%20card%20payment%20is%20₹50`);
        } else if (paymentMethod === "upi" && amount < 10) {
            console.log("Error: Amount is below UPI minimum threshold.");
            return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Minimum%20amount%20for%20UPI%20payment%20is%20₹10`);
        } else if (!paymentMethod && amount < 10) {
            // Fallback for when payment method is not specified yet
            console.log("Error: Amount is below the minimum threshold.");
            return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Minimum%20amount%20is%20₹10`);
        }

        if (paymentMethod === "stripe_card") {
            console.log("Processing Stripe card payment...");
            
            if (!stripePaymentMethodId) {
                console.log("Error: Stripe payment method ID not provided.");
                return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Payment%20method%20not%20provided`);
            }

            try {
                // Create and confirm payment intent with the payment method
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(amount * 100), // Convert to smallest currency unit
                    currency: "inr",
                    payment_method: stripePaymentMethodId,
                    confirmation_method: 'manual',
                    confirm: true,
                    return_url: `${req.protocol}://${req.get('host')}/hotel/tipEmployee/${employeeId}?success=true`,
                    metadata: { employeeId, hotelId },
                });

                console.log("Stripe paymentIntent created and confirmed:", paymentIntent.id);

                // Save tip record with confirmed status
                const tip = new Tip({
                    employeeID: employeeId,
                    hotelID: hotelId,
                    amount,
                    paymentMethod: "stripe_card",
                    stripeChargeID: paymentIntent.id,
                    paymentStatus: paymentIntent.status === 'succeeded' ? "succeeded" : "pending",
                });
                await tip.save();

                console.log("Tip record saved:", tip);

                if (paymentIntent.status === 'succeeded') {
                    console.log("Payment succeeded, redirecting to success page");
                    return res.redirect(`/hotel/tipEmployee/${employeeId}?success=true&message=Payment%20successful`);
                } else if (paymentIntent.status === 'requires_action') {
                    // Handle 3D Secure or other authentication
                    console.log("Payment requires additional authentication");
                    return res.json({
                        requires_action: true,
                        payment_intent: {
                            id: paymentIntent.id,
                            client_secret: paymentIntent.client_secret
                        }
                    });
                } else {
                    console.log("Payment failed with status:", paymentIntent.status);
                    return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Payment%20failed`);
                }

            } catch (stripeError) {
                console.error("Stripe payment error:", stripeError);
                return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=${encodeURIComponent(stripeError.message)}`);
            }

        } else if (paymentMethod === "upi") {
            console.log("Processing UPI payment...");

            // Fetch employee UPI ID
            const employee = await Employee.findById(employeeId);
            if (!employee || !employee.upiID) {
                console.log("Error: Employee UPI ID not found.");
                return res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=UPI%20ID%20not%20found`);
            }

            const upiID = employee.upiID.trim();
            const encodedNote = encodeURIComponent(`Tip Payment - ${employee.username}`);
            const upiDeepLink = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(employee.username)}&am=${amount}&cu=INR&tn=${encodedNote}`;

            console.log(`Generated UPI Deep Link: ${upiDeepLink}`);

            // Save tip record with pending status
            const tip = new Tip({
                employeeID: employeeId,
                hotelID: hotelId,
                amount,
                paymentMethod: "upi",
                paymentStatus: "pending",
            });
            await tip.save();

            console.log("Tip record saved for UPI payment:", tip);

            // Redirect based on UPI app selection
            let redirectURL;
            switch (upiApp) {
                case "gpay":
                    redirectURL = `intent://pay?pa=${upiID}&pn=${encodeURIComponent(employee.username)}&am=${amount}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
                    break;
                case "phonepe":
                    redirectURL = `intent://pay?pa=${upiID}&pn=${encodeURIComponent(employee.username)}&am=${amount}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=com.phonepe.app;end`;
                    break;
                case "paytm":
                    redirectURL = `intent://pay?pa=${upiID}&pn=${encodeURIComponent(employee.username)}&am=${amount}&cu=INR&tn=${encodedNote}#Intent;scheme=upi;package=net.one97.paytm;end`;
                    break;
                default:
                    redirectURL = upiDeepLink; // Generic fallback
            }

            console.log(`Redirecting to UPI URL: ${redirectURL}`);
            res.redirect(redirectURL);
        } else {
            console.log("Error: Invalid payment method selected.");
            res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Invalid%20Payment%20Method`);
        }
    } catch (error) {
        console.error("Error processing tip:", error);
        res.redirect(`/hotel/tipEmployee/${employeeId}?success=false&message=Error%20Processing%20Tip`);
    }
});


// Route to open the tip payment page
router.get('/hotel/tipEmployee/:employeeId', async (req, res) => {
    const { employeeId } = req.params;

    try {
        const employee = await Employee.findById(employeeId)
            .populate({
                path: 'hotelID',
                populate: { path: 'locationID' }
            })
            .populate('managerID');
        if (!employee) {
            return res.status(404).send('Employee not found');
        }

        const hotel = employee.hotelID;

        res.render('listings/tipForm.ejs', { 
            employee, 
            hotel,
            stripePublicKey: process.env.STRIPE_PUBLISHABLE_KEY
        });
    } catch (error) {
        console.error('Error fetching employee details:', error.message);
        res.status(500).send('Error loading tipping form.');
    }
});


// Route to open tipHistory page
router.get('/employeeAccount/tipHistory',isLoggedInEmployee, async (req, res) => {
    try {
        // Get employee ID from session/auth (adjust based on your authentication system)
        const employeeId = req.session.employeeId || req.user.id; // Adjust this line based on your auth system
        
        if (!employeeId) {
            return res.redirect('/login'); // Redirect to login if not authenticated
        }

        // Get current date and calculate date ranges
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Calculate week start (Monday)
        const weekStart = new Date(today);
        const dayOfWeek = today.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, so we need 6 days back
        weekStart.setDate(today.getDate() - daysToMonday);

        // Calculate month start
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch today's tips
        const todayTips = await Tip.find({
            employeeID: employeeId,
            createdAt: {
                $gte: today,
                $lt: tomorrow
            }
        }).populate('hotelID', 'name').sort({ createdAt: -1 });

        // Fetch this week's tips
        const weekTips = await Tip.find({
            employeeID: employeeId,
            createdAt: {
                $gte: weekStart,
                $lt: tomorrow
            }
        }).populate('hotelID', 'name').sort({ createdAt: -1 });

        // Fetch this month's tips
        const monthTips = await Tip.find({
            employeeID: employeeId,
            createdAt: {
                $gte: monthStart,
                $lt: tomorrow
            }
        }).populate('hotelID', 'name').sort({ createdAt: -1 });

        // Calculate totals
        const todayTotal = todayTips.reduce((sum, tip) => {
            return tip.paymentStatus === 'succeeded' ? sum + tip.amount : sum;
        }, 0);

        const weekTotal = weekTips.reduce((sum, tip) => {
            return tip.paymentStatus === 'succeeded' ? sum + tip.amount : sum;
        }, 0);

        const monthTotal = monthTips.reduce((sum, tip) => {
            return tip.paymentStatus === 'succeeded' ? sum + tip.amount : sum;
        }, 0);

        // Count tips by status for today
        const todayStats = {
            succeeded: todayTips.filter(tip => tip.paymentStatus === 'succeeded').length,
            pending: todayTips.filter(tip => tip.paymentStatus === 'pending').length,
            failed: todayTips.filter(tip => tip.paymentStatus === 'failed').length
        };

        // Get employee details
        const employee = await Employee.findById(employeeId);

        const data = {
            employee,
            today: {
                tips: todayTips,
                total: todayTotal,
                stats: todayStats,
                date: today.toDateString()
            },
            week: {
                tips: weekTips,
                total: weekTotal,
                startDate: weekStart.toDateString(),
                endDate: today.toDateString()
            },
            month: {
                tips: monthTips,
                total: monthTotal,
                monthName: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            }
        };

        res.render('listings/tipDetails.ejs', data);

    } catch (error) {
        console.error('Error fetching tip history:', error);
        res.status(500).send('Error fetching tip history');
    }
});


// Update Payment Status

router.post("/stripe-webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send("Webhook Error");
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const tip = await Tip.findOneAndUpdate(
            { stripeChargeID: paymentIntent.id },
            { paymentStatus: "succeeded" },
            { new: true }
        );
        console.log("Payment succeeded for tip:", tip);
    } else if (event.type === "payment_intent.payment_failed") {
        const paymentIntent = event.data.object;
        const tip = await Tip.findOneAndUpdate(
            { stripeChargeID: paymentIntent.id },
            { paymentStatus: "failed" },
            { new: true }
        );
        console.log("Payment failed for tip:", tip);
    }

    res.json({ received: true });
});




module.exports = router;
