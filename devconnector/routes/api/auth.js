const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

//@route GET api/auth
//@desc Verify users
//access Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user)
    //res.send('auth route');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error')
  }
});

module.exports = router;