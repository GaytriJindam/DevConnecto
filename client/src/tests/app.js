const express = require('express');
const app = express();
const userRoutes = require('../../../routes/api/users');
const authRoutes = require('../../../routes/api/auth');

app.use(express.json()); // Parse JSON bodies
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;
