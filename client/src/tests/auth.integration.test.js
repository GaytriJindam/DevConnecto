const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('./app');
const User = require('../../../models/User');
const config = require('config');
const JWT_SECRET = config.get('jwtSecret');

jest.setTimeout(20000);

describe('Developer Connecto Integration Tests', () => {
  beforeAll(async () => {
    const dbUri = config.get('mongoURI');
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  });

   afterEach(async () => {
   await mongoose.connection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('User Registration', () => {
    it('should register a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
      };


      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('User Login', () => {
    it('should login and return a JWT token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: hashedPassword,
      });
      await user.save();

      const loginData = {
        email: 'johndoe@example.com',
        password: 'password123',
      };


      const response = await request(app)
        .post('/api/auth')
        .send(loginData)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      const decoded = jwt.verify(response.body.token, JWT_SECRET || 'testSecret');
      expect(decoded.user).toHaveProperty('id', user._id.toString());
    });
  });
});
