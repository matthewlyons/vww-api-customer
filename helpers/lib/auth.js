require('dotenv').config();

const axios = require('axios');

module.exports = {
  authMiddleware(accessLevel) {
    return async function makeRequest(req, res, next) {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      let authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(401).json({ errors: [{ message: 'Unauthorized' }] });
      }
      axios({
        method: 'post',
        url: process.env.API_AUTH + '/auth/token',
        timeout: 3000,
        headers: {
          Authorization: authHeader
        },
        data: { accessLevel }
      })
        .then((result) => {
          next();
        })
        .catch((err) => {
          if (err.code === 'ECONNREFUSED') {
            return res
              .status(401)
              .json({ errors: [{ message: 'Auth Service is Unresponsive' }] });
          }
          return res
            .status(401)
            .json({ errors: [{ message: 'Unauthorized' }] });
        });
    };
  }
};
