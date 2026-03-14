const express = require('express');
const connectDB = require('./db/connect');

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});