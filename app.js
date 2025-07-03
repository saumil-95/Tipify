
if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');


// signup/login
const LocalStrategy = require("passport-local");
const passport = require("passport");
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

//Models
const Manager = require('./models/manager.js');
const Employee = require('./models/employee.js');



//Routes
const hotels = require("./routes/hotel.js");
const locations = require("./routes/location.js");
const managers = require('./routes/manager.js');
const employees = require('./routes/employee.js');
const employeesAuth = require('./routes/employeeAuth.js');
const tips = require('./routes/tip.js');
const abouts = require('./routes/about.js');







app.set("view engine" , "ejs");
app.set("views" ,path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")))
app.engine("ejs",ejsMate); 



//connection to db
main().then(() =>{
  console.log("Connection Successful");
})
.catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb://127.0.0.1/tipping');
}


app.use(session({
  secret: process.env.SECRET, 
  resave:false ,
  saveUninitialized:false,
  cookie: {
    expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,   
  }  
}));

app.use(flash());

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Manager passport configuration (existing)
passport.use("local", new LocalStrategy(Manager.authenticate()));

// Employee passport configuration (new)
passport.use("employee-local", new LocalStrategy(Employee.authenticate()));

// Updated serialization to handle both Manager and Employee
passport.serializeUser((user, done) => {
    // Check if user is Manager or Employee
    if (user.constructor.modelName === 'Manager') {
        done(null, { id: user._id, type: 'manager' });
    } else if (user.constructor.modelName === 'Employee') {
        done(null, { id: user._id, type: 'employee' });
    } else {
        done(new Error('Unknown user type'), null);
    }
});

passport.deserializeUser(async (obj, done) => {
    try {
        let user;
        if (obj.type === 'manager') {
            user = await Manager.findById(obj.id);
        } else if (obj.type === 'employee') {
            user = await Employee.findById(obj.id);
        }
        
        if (user) {
            done(null, user);
        } else {
          done(null, false); 
            // done(new Error('User not found'), null);
        }
    } catch (err) {
        done(err, null);
    }
});

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;

//   res.locals.currUser = req.user || null;
  next();
});


app.get('/', (req, res) => {
  res.send('Hello from tipping!');
});



app.use("/hotel", hotels);
app.use("/location", locations);
app.use("/", managers);
app.use("/employee", employees);
app.use("/employeeAccount", employeesAuth);
app.use("/", tips);
app.use("/", abouts);





// app.listen(3000, '0.0.0.0', () => {
//   console.log(`Server running on http://localhost:3000`);
// });



app.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
