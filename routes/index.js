const auth = require('./auth');
const router = require('express').Router();
router.get('/is_up', (req, res) => { res.json({success: true})});
router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/verifyPhone', auth.verifyPhone);

const sms = require('./sms');
router.post('/sms/receive', sms.respondToSMS);
router.post('/sms/sendTest', sms.sendTestSMS)

/********************
 * PROTECTED ROUTES *
 *********************/
router.use(auth.verifyToken);

const user = require('./user');
router.get('/user', user.user);

const budget = require('./budget');
router.get('/budget', budget.getAll);
router.get('/budget/:id', budget.getOne);
router.post('/budget/createCategory', budget.createCategory);
router.post('/budget/editCategory', budget.editCategory);
router.post('/budget/deleteCategory', budget.deleteCategory);
module.exports = router;
