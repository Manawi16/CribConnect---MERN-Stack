const router = require('express').Router();
const passport=require("passport");
const User = require('../models/User');
const {routeAuthentication }= require('../middlewares/routeAuthentication');

const {generateUserToken,generateStateToken,decodeStateToken} = require('../services/generateJWT'); 


// GET /api/auth/me
router.get('/me', routeAuthentication, (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name,role: req.user.role, profile_url: req.user.profile_url });
});

router.get("/preauth",(req,res,next)=>{
  const {flow,role}=req.query;
  if (!["login", "signup"].includes(flow)) {
    return res.status(400).send("Invalid flow");
  }

  if (flow === "signup" && !["tenant", "landlord"].includes(role)) {
    return res.status(400).send("Invalid role");
  }

  const stateToken = generateStateToken({ flow, role });
  
  passport.authenticate('google', {  
    scope: ['profile', 'email'],
    state: stateToken,
    session: false
  })(req, res, next);
})

// router.get("/google/callback",passport.authenticate('google', {session:false}), (req, res) => {
//     try{
//         const role = req.query.state || req.user.role;
//         if(!req.user.role){
//           res.status(400).json({ error: "User role is not defined. User log in and did not have a account" });
//           return;
//         }
//         const token= generateUserToken(req.user);
//         res.cookie("jwtToken", token, {
//             httpOnly: true,
//             secure: false,
//             sameSite: 'Lax',
//             maxAge: 7 * 24 * 60 * 60 * 1000 
//         }); 
//         return res.redirect(`http://localhost:3000/dashboard?role=${role}`); ;
//     }
//     catch (error) {
//         console.error("Error during Google authentication callback:", error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// })
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" ,session:false}),
  async (req, res) => {
    const state = decodeStateToken(req.query.state);
    if (!state) {
      return res.redirect("http://localhost:3000/error?reason=invalid_oauth_state");
    }
    const { flow, role } = state;
    const email = req.user.emails[0].value;
    let isUser = await User.findOne({ email });
    if (flow === "login") {
      if (!isUser) {
        return res.redirect("http://localhost:3000/error?reason=not_registered");
      }
    }
    if (flow === "signup") {
      if (isUser) {
        return res.redirect("http://localhost:3000/error?reason=already_registered");
      }
      isUser = await User.create({
        googleId: req.user.id,
        name: req.user.displayName,
        email: req.user.emails[0].value,
        profile_url: req.user.photos[0].value,
        role:role,
        isEmailVerified:true
      }); 
    }
    const userToken= generateUserToken(isUser);
      res.cookie("jwtToken", userToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      }); 
    return res.redirect(`http://localhost:3000/dashboard?role=${isUser.role}`);
  }
);

router.post("/logout",routeAuthentication,(req,res)=>{
    res.clearCookie("jwtToken");
    res.redirect("/");
});

module.exports=router;