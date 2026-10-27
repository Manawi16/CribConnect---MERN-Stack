// const express=require("express");
// const path=require("path");
// const connectDB = require('./dbConnection/connect');
// const authRoutes = require('./router/authRoutes');
// const dashboardRoutes = require('./router/dashboardRoutes');
// const phoneRoutes = require('./router/phoneRoutes');
// const communityPostRoutes = require('./router/communityPostRoutes');
// const communityRoutes = require('./router/communityRoutes');
// const listingRoutes = require('./router/listingRoutes');
// const panVerification=require("./router/panVerification")
// const directionRoutes = require('./router/directionRoutes');
// const tenantAutocompleteRoutes=require("./router/tenantAutocompleteRoutes");
// const passport=require("./services/passport");
// const tenantRoutes=require("./router/tenantRoutes");
// const landlordRoutes=require("./router/landlordRoutes");
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();

// const { handleChat, handleHistory } = require('./controllers/cribbyController');

// const app=express();
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(cookieParser());
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: ['GET', 'POST']   // added from 1.js
// }));
// app.use(express.urlencoded({extended:true})); // Needed to parse JSON body

// app.use(passport.initialize());
// app.get("/api",(req,res)=>{
//     res.render('auth-choice');
// });

// app.use("/api",directionRoutes);
// app.use("/api",communityRoutes);
// app.use('/api/post', communityPostRoutes);
// app.use("/api",listingRoutes);
// app.use('/api', listingRoutes);
// app.use('/api', tenantAutocompleteRoutes);
// app.use('/api', panVerification);
// app.use('/api/auth', authRoutes);
// app.use('/api/phone', phoneRoutes);
// app.use('/dashboard', dashboardRoutes);
// app.use("/api/tenant",tenantRoutes)
// app.use("/api/landlord",landlordRoutes)

// app.post('/api/chat', handleChat);
// app.get('/api/history', handleHistory);

// const PORT = 5000; // allow fallback if .env doesn't have PORT
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });



// const express=require("express");
// const path=require("path");
// const connectDB = require('./dbConnection/connect');
// const authRoutes = require('./router/authRoutes');
// const dashboardRoutes = require('./router/dashboardRoutes');
// const phoneRoutes = require('./router/phoneRoutes');
// const communityPostRoutes = require('./router/communityPostRoutes');
// const communityRoutes = require('./router/communityRoutes');
// const listingRoutes = require('./router/listingRoutes');
// const panVerification=require("./router/panVerification")
// const directionRoutes = require('./router/directionRoutes');
// const tenantAutocompleteRoutes=require("./router/tenantAutocompleteRoutes");
// const passport=require("./services/passport");
// const tenantRoutes=require("./router/tenantRoutes");
// const landlordRoutes=require("./router/landlordRoutes");
// const cors = require('cors');
// const cookieParser = require('cookie-parser');
// require('dotenv').config();

// const app=express();
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(cookieParser());
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.urlencoded({extended:true}));
//  // Needed to parse JSON body

// app.use(passport.initialize());
// app.get("/api",(req,res)=>{
//     res.render('auth-choice');
// });

// app.use("/api",directionRoutes);
// app.use("/api",communityRoutes);
// app.use('/api/post', communityPostRoutes);
// app.use("/api",listingRoutes);
// app.use('/api', listingRoutes);
// app.use('/api', tenantAutocompleteRoutes);
// app.use('/api', panVerification);
// app.use('/api/auth', authRoutes);
// app.use('/api/phone', phoneRoutes);
// app.use('/dashboard', dashboardRoutes);
// app.use("/api/tenant",tenantRoutes)
// app.use("/api/landlord",landlordRoutes)

// const PORT = process.env.PORT;
// connectDB().then(() => {
//   app.listen(process.env.PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// });







const express=require("express");
const path=require("path");
const connectDB = require('./dbConnection/connect');
const authRoutes = require('./router/authRoutes');
const dashboardRoutes = require('./router/dashboardRoutes');
const phoneRoutes = require('./router/phoneRoutes');
const communityPostRoutes = require('./router/communityPostRoutes');
const communityRoutes = require('./router/communityRoutes');
const listingRoutes = require('./router/listingRoutes');
const panVerification=require("./router/panVerification")
const directionRoutes = require('./router/directionRoutes');
const tenantAutocompleteRoutes=require("./router/tenantAutocompleteRoutes");
const passport=require("./services/passport");
const tenantRoutes=require("./router/tenantRoutes");
const landlordRoutes=require("./router/landlordRoutes");
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { handleChat, handleHistory } = require('./controllers/cribbyController');



const app=express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST']
}));
app.use(express.urlencoded({extended:true}));

app.use(passport.initialize());
app.get("/api",(req,res)=>{
  res.render('auth-choice');
});
console
app.use("/api",directionRoutes);
app.use("/api",communityRoutes);
app.use('/api/post', communityPostRoutes);
app.use("/api",listingRoutes);
app.use('/api', listingRoutes);
app.use('/api', tenantAutocompleteRoutes);
app.use('/api', panVerification);
app.use('/api/auth', authRoutes);
app.use('/api/phone', phoneRoutes);
app.use('/dashboard', dashboardRoutes);
app.use("/api/tenant",tenantRoutes)
app.use("/api/landlord",landlordRoutes)

app.post('/api/chat', handleChat);
app.get('/api/history', handleHistory);

const PORT = 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

