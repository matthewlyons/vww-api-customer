const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/', require('./routes'));

app.all('/*', function (req, res) {
  return res.status(404).json({ errors: [{ message: 'Route Not Found' }] });
});

module.exports = app;
