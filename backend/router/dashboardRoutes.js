const router = require('express').Router();
const {routeAuthentication }= require('../middlewares/routeAuthentication');

router.get("",routeAuthentication, (req, res) => {
    res.render('dashboard',{ user: req.user })
    console.log("Dashboard accessed by user:", req.user);
});


module.exports = router;