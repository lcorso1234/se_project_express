const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3001;

app.use(express.json());
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://146.148.33.166:3000',
  'https://146.148.33.166',
  'https://jungwebsites.com/',
  'http://jungwebsites.com/',
  'https://www.jungwebsites.com/',
  'http://www.jungwebsites.com/',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(routes);

app.listen(PORT, () => {
  process.stdout.write(`Server listening on port ${PORT}\n`);
});

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');
