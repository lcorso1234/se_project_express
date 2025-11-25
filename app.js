const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');
