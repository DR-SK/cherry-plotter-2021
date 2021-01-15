const { Router } = require('express');
const UserService = require('../services/Userservice');
// const ensureAuth = require('../middleware/ensure-auth');



module.exports = Router()   
  .post('/signup', (req, res, next) => {  
    UserService
      .create(req.body)
      .then(user => {
        // res.cookie('session', UserService.authToken(user), {
        //   httpOnly: true,
        //   maxAge: 1000 * 60 * 60 * 24,
        //   sameSite: 'none',
        //   secure: process.env.NODE_ENV === 'production'
        // });
        res.send(user); 
      })
      .catch(next);

