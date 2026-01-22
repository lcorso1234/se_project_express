const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3001;
app.use((req, res, next) => {
  req.user = {
    _id: '5d8b8592978f8bd833ca8133',
  };
  next();
});
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(routes);

app.listen(PORT, () => {
  process.stdout.write(`Server listening on port ${PORT}\n`);
});

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');
