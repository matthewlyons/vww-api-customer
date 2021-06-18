const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use('/', require('./routes'));

app.get('/*', (req, res) => {
  res.send('Hello World!');
});

module.exports = app;
