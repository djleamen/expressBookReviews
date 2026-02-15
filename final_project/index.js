const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const lusca = require('lusca');
const rateLimit = require('express-rate-limit');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))
app.use("/customer", lusca.csrf());

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs for auth routes
});

app.use("/customer/auth/*", authRateLimiter);
app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) {
        let token = req.session.authorization['accessToken'];
        jwt.verify(token, "access", (err, user) => {
            if(!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({message: "User not authenticated"});
            }
        });
    } else {
        return res.status(403).json({message: "User not logged in"});
    }
});
 
const PORT = process.env.PORT || 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
