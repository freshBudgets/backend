const plaid = require('plaid');
const mongoose = require('mongoose');

const User = mongoose.model('Users');
const PlaidInstitution = mongoose.model('PlaidInstitutions');

const PLAID_WEBHOOK_URL = 'https://api.freshbudgets.com/api/plaid/transaction';
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID_SB;
const PLAID_DEV_SECRET = process.env.PLAID_DEV_SECRET_SB;
const PLAID_PUBLIC_ID = process.env.PLAID_PUBLIC_ID_SB;
const PLAID_ENV = plaid.environments.sandbox;
const plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_DEV_SECRET, PLAID_PUBLIC_ID, PLAID_ENV);

const linkPlaidAccount = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    const accountIDs = req.body.accountIDs;
    const publicToken = req.body.publicToken;

    plaidClient.exchangePublicToken(publicToken, function(err, result) {
        if (err) {
            if (plaid.isPlaidError(err)) {
              console.log(err.error_code + ': ' + err.error_message);
            } else {
              console.log(err.toString());
            }
            res.json({
                success: false,
                message: 'Plaid public token unable to be exchanged for access token.'
            });
        }
        const accessToken = res.access_token;
        var plaidAccount = new PlaidInstitution({
            accessToken: accessToken,
            accountIDs: accountIDs,
            user: userID
        });
        console.log(plaidAccount);
        plaidAccount.save();
    });
};

const handlePlaidTransaction = function(req, res) {
    res.json({success: true, message:"stub"});
};

module.exports = {
    linkPlaidAccount,
    handlePlaidTransaction
};

