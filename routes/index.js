const auth = require('./auth');
const router = require('express').Router();
router.get('/is_up', (req, res) => { res.json({success: true})});
router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/verifyPhone', auth.verifyPhone);

const sms = require('./sms');
router.post('/sms/receive', sms.respondToSMS);
router.post('/sms/sendTest', sms.sendTestSMS);

/********************
 * PROTECTED ROUTES *
 *********************/
router.use(auth.verifyToken);

const user = require('./user');
router.get('/user', user.user);

const budget = require('./budget');
router.get('/budget', budget.getAll);
router.get('/budget/:id', budget.getOne);


const settings = require('./settings');
router.post('/settings/update', settings.update);
router.get('/settings', settings.getSettings);

const plaid = require('./plaid');
router.post('/plaid/link', plaid.linkPlaidAccount);
router.post('/plaid/transaction', plaid.handlePlaidTransaction);


module.exports = router;
