const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/change', async function (req, res) {
    res.render('viewPass/change', {
      layout: false
    });
  })
module.exports = router;