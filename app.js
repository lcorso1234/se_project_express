require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errors } = require('celebrate');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

mongoose.connect('mongodb://127.0.0.1:27017/wtwr_db');

const app = express();
const { PORT = 3001 } = process.env;
app.use(express.json());
app.use(cors());

// Log all requests and responses
app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(routes);

// Log errors
app.use(errorLogger);

// Celebrate error formatter for validation errors
app.use(errors());

// Centralized error handler should be last
app.use(errorHandler);

app.listen(PORT, () => {
  process.stdout.write(`Server listening on port ${PORT}\n`);
});
