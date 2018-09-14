var auth = require('./auth');
var router = require('express').Router();
router.get('/is_up', (req, res) => { res.json({success: true})});
router.post('/signup', auth.signup);
router.post('/login', auth.login);

module.exports = router;
