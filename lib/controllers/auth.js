const { Router } = require('express');
// const ensureAuth = require('../middleware/ensure-auth');
const UserService = require('../services/Userservice');

module.exports = Router() 
  .post('/signup', (req, res, next) => {
    UserService
      .create(req.body)
      .then(user => {
        res.cookie('session', UserService.authToken(user), {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
          sameSite: 'none',
          secure: process.env.NODE_ENV === 'production'
        });
        res.send(user); 
      })
      .catch(next);
  });

