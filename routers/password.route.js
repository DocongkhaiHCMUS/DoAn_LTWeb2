const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/change', async function (req, res) {
    res.render('viewPassword/change', {
      layout: false
    });
  })
module.exports = router;