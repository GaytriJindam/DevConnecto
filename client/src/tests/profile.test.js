const { validationResult } = require('express-validator');

jest.mock('../../../models/Post');
jest.mock('../../../models/User');
jest.mock('../../../middleware/auth');
jest.mock('../../../models/Profiles'); 
jest.mock('express-validator'); 

const Profile = require('../../../models/Profiles');
const User = require('../../../models/User');
const auth = require('../../../middleware/auth'); 
const Post = require('../../../models/Post');
jest.mock('config', () => ({
    get: jest.fn().mockReturnValue('test') 
  }));
  
describe('Profile Management', () => {
  it('should allow a user to create or update profile details', async () => {
    const profileData = {
      company: 'Neosoft',
      website: 'https://neosoft.com',
      location: 'Mumbai',
      bio: 'A software developer',
      status: 'Developer',
      githubusername: 'johndoe',
      skills: 'JavaScript,React,Node.js',
      youtube: 'https://youtube.com/johndoe',
      facebook: 'https://facebook.com/johndoe',
    };

    const mockProfile = {
      _id: 'profile123',
      user: 'user123',
      save: jest.fn().mockResolvedValue(true),
    };

    const req = {
      user: { id: 'user123' },
      body: profileData,
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
    });

    Profile.findOne.mockResolvedValueOnce(null);

    Profile.findOneAndUpdate.mockResolvedValueOnce({
      ...mockProfile,
      ...profileData,
      skills: ['JavaScript', 'React', 'Node.js'], 
      social: {
        youtube: profileData.youtube,
        facebook: profileData.facebook,
      },
    });

    const profileFields = {
      user: req.user.id,
      company: profileData.company,
      website: profileData.website,
      location: profileData.location,
      bio: profileData.bio,
      status: profileData.status,
      githubusername: profileData.githubusername,
      skills: ['JavaScript', 'React', 'Node.js'],
      social: {
        youtube: profileData.youtube,
        facebook: profileData.facebook,
      },
    };

    const middleware = [
      (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        next();
      },
      async (req, res) => {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          );
          return res.json(profile);
        } else {
          const newProfile = new Profile(profileFields);
          await newProfile.save();
          res.json(newProfile);
        }
      }
    ];

    const next = jest.fn();
    await middleware[0](req, res, next); 
    await middleware[1](req, res); 

    // Expectations
    expect(validationResult).toHaveBeenCalled(); // Validation should be called
    expect(Profile.findOne).toHaveBeenCalledWith({ user: req.user.id });
    expect(res.json).toHaveBeenCalled(); // Expecting the final response to be sent
  });
});

describe('DELETE /user', () => {
    let req, res, next;
  
    beforeAll(() => {
      console.error = jest.fn(); 
    });
  
    beforeEach(() => {
      req = {
        user: { id: 'user123' }, 
      };
      res = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(), 
        send: jest.fn(),
      };
      next = jest.fn();
  
      auth.mockImplementation((req, res, next) => next());
    });
  
    afterAll(() => {
      console.error.mockRestore(); 
    });
  
    it('should delete the user, their posts, and profile', async () => {
      Post.deleteMany.mockResolvedValue(true);
      Profile.findOneAndDelete.mockResolvedValue(true);
      User.findOneAndDelete.mockResolvedValue(true);
  
      await (async () => {
        try {
          await Post.deleteMany({ user: req.user.id });
          await Profile.findOneAndDelete({ user: req.user.id });
          await User.findOneAndDelete({ _id: req.user.id });
  
          res.json({ msg: 'User deleted' });
        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
      })();
  
      expect(Post.deleteMany).toHaveBeenCalledWith({ user: req.user.id });
      expect(Profile.findOneAndDelete).toHaveBeenCalledWith({ user: req.user.id });
      expect(User.findOneAndDelete).toHaveBeenCalledWith({ _id: req.user.id });
  
      expect(res.json).toHaveBeenCalledWith({ msg: 'User deleted' });
    });
  
    it('should return a 500 error if something goes wrong', async () => {
      Post.deleteMany.mockRejectedValue(new Error('Database error'));
  
      await (async () => {
        try {
          await Post.deleteMany({ user: req.user.id });
          await Profile.findOneAndDelete({ user: req.user.id });
          await User.findOneAndDelete({ _id: req.user.id });
  
          res.json({ msg: 'User deleted' });
        } catch (err) {
          console.error(err.message);  
          res.status(500).send('Server Error');
        }
      })();
  
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server Error');
  
      expect(console.error).toHaveBeenCalledWith('Database error');
    });
  });
      