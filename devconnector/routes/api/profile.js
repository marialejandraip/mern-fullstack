const express = require('express');
const router = express.Router();

//@route GET api/profile/me
//@desc current user profile
//access Private
router.get('/', (req, res) => {
  res.send('profile route');
});

module.exports = router;