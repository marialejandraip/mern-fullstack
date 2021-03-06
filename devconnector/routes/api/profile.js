const express = require('express');
const router = express.Router();
const { body, validationResult, check } = require('express-validator');
const { profile_url } = require('gravatar');
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route GET api/profile/me
//@desc current user profile
//access Private
//Adding auth to verify which one is the user profile
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);

    if(!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      });
    }

    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
  res.send('profile route');
});

//@route POST api/profile
//@desc create or update user profile
//access Private
router.post('/', [ auth, [
    body('status', 'Status is required').not().isEmpty(),
    body('skills', 'Skills is required').not().isEmpty()
    ]
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

  // Build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  if(skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
    //console.log(typeof(profileFields.skills));
  }

  //Build social array
  profileFields.social = {};
  if(youtube) profileFields.social.youtube = youtube;
  if(instagram) profileFields.social.instagram = instagram;
  if(twitter) profileFields.social.twitter = twitter;
  if(facebook) profileFields.social.facebook = facebook;
  if(linkedin) profileFields.social.linkedin = linkedin;
  

  console.log(profileFields);

  //res.send('hellowsito')
  try {
    let profile = Profile.findOne({ user: req.user.id });
    // if(profile){
    //   //update profile
    profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, {new: true});
    //   return res.json(profile);
    // }
    console.log(profile);
    //Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error!')
  }
});

//@route GET api/profile
//@desc get all profiles
//access Public
router.get('/', async(req, res)=> {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    res.json(profiles)
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error!')
  }
});

//@route GET api/profile/user/:user_id
//@desc get all profiles
//access Public
router.get('/user/:user_id', async(req, res)=> {
  try {
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
    if(!profile) return res.status(400).json({msg: 'Not profile for this user'})
    res.json(profile)
    
  } catch (error) {
    console.error(error.message);
    if(error.kind == "ObjectId") {
      res.status(400).json({msg: 'Profile not found'})
    }

    res.status(500).send('Server Error!')
  }
});

//@route DELETE api/profile
//@desc delete profile, user and posts
//access Private
router.delete('/', auth, async(req, res)=> {
  try {
    //pending posts 
    //Remove profile and user
    await Profile.findOneAndRemove({ user: req.user.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({msg: 'User deleted!'})

  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error!')
  }
});

//@route PUT api/profile/experience
//@desc update user experience
//access Private
router.put('/experience', [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty()
]], async(req, res)=> {

  //validation of checks 
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()})
  }
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body

  const newExp = { 
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({user: req.user.id});
    console.log(profile);
    // like push but on first
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile, {msg: 'Profile updated!'})

  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error!')
  }
});

//@route DELETE api/profile/experience/:exp_id
//@desc delete user experience
//access Private
router.delete ('experience/:exp_id', auth, async (req, res)=> {
  try {
    const profile = Profile.findOne({user: req.user.id});
    //Get remove index
    const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
    // get index from array of objects experience
    profile.experience.splice(removeIndex,1)
    // save change
    await profile.save();

    res.json(profile);
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json('Server Error!')
  }
})

module.exports = router;