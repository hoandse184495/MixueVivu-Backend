const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'MixueVivu API is running',
  });
});

app.use('/api', routes);

app.use(errorMiddleware);

module.exports = app;