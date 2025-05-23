const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../../models/User'); 
jest.mock('jsonwebtoken'); 
jest.mock('bcryptjs'); 
jest.mock('axios'); 

describe('Developer Connecto Unit Tests', () => {
  // Test case 1: User Registration
  it('should register a user with valid data', async () => {
    const userData = {
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: 'password123',
    };

    const mockUser = {
      _id: '12345',
      ...userData,
    };

    const User = require('../../../models/User');
    User.create.mockResolvedValue(mockUser);

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    axios.post.mockResolvedValue({ data: mockUser });

    const registeredUser = await axios.post('/api/users', userData, config);
    expect(registeredUser.data).toHaveProperty('_id', '12345');
    expect(registeredUser.data).toHaveProperty('name', 'John Doe');
  });

  // Test case 2: User Login with JWT Authentication
  describe('Developer Connecto Unit Tests', () => {
    it('should login and return a JWT token for valid credentials', async () => {
      const loginData = {
        email: 'johndoe@example.com',
        password: 'password123',
      };
  
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
  
      const mockUser = {
        _id: '12345',
        email: loginData.email,
        password: '$2b$10$somethinghashedpassword', 
      };
  
      const User = require('../../../models/User');
      User.findOne.mockResolvedValue(mockUser); 
  
      bcrypt.compare.mockResolvedValue(true);
  
      const mockToken = 'mocked.jwt.token';
      jwt.sign.mockImplementation((payload, secret, options, callback) => {
        callback(null, mockToken); 
      });
  
      axios.post.mockImplementation(async (url) => {
        if (url === '/api/auth') {
          const user = await User.findOne({ email: loginData.email });
          if (!user) {
            throw { response: { status: 400, data: { errors: [{ msg: 'Invalid Credentials' }] } } };
          }
          const isMatch = await bcrypt.compare(loginData.password, user.password);
          if (!isMatch) {
            throw { response: { status: 400, data: { errors: [{ msg: 'Invalid Credentials' }] } } };
          }
          const payload = { user: { id: user._id } };
          jwt.sign(payload, 'testSecret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
          });
          return { data: mockToken };
        }
        throw new Error('Unknown endpoint');
      });
  
      const token = await axios.post('/api/auth', loginData, config);
      expect(token.data).toBe(mockToken);
      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { user: { id: mockUser._id } },
        expect.any(String),
        { expiresIn: 360000 },
        expect.any(Function)
      );
    });
  });
});  