const plaid = require('plaid');
const mongoose = require('mongoose');

const PlaidInstitution = mongoose.model('PlaidInstitutions');

const PLAID_WEBHOOK_URL = 'localhost:5000/api/plaid/transaction';
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID_SB;
const PLAID_DEV_SECRET = process.env.PLAID_DEV_SECRET_SB;
const PLAID_PUBLIC_ID = process.env.PLAID_PUBLIC_ID_SB;
const PLAID_ENV = plaid.environments.sandbox;
const plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_DEV_SECRET, PLAID_PUBLIC_ID, PLAID_ENV);

const linkPlaidAccount = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    const accountIDs = req.body.accountIDs;
    const publicToken = req.body.publicToken;

    plaidClient.exchangePublicToken(publicToken).then(result => {
        const accessToken = result.access_token;
        plaidClient.updateItemWebhook(accessToken, PLAID_WEBHOOK_URL).then(result => {
            var plaidAccount = new PlaidInstitution({
                accessToken: accessToken,
                accountIDs: accountIDs,
                user: userID
            });
            plaidAccount.save(function(err) {
                if(err) {
                    res.json({
                        success: false,
                        message: 'unable to save plaidInsitution to user'
                    });
                }
                else {
                    res.json({
                        success: true,
                        message: 'saved plaidAccount to user'
                    });
                }
            });
        });
    }).catch(err => {
        if (err != null) {
            if (plaid.isPlaidError(err)) {
              res.json({
                  success: false,
                  message: err.error_code + ': ' + err.error_message
                });
            } else {
              res.json({
                  success:false,
                  message: err.toString()
              });
            }
          }
    });
};

const handlePlaidTransaction = function(req, res) {
    res.json({success: true, message:"stub"});
};

module.exports = {
    linkPlaidAccount,
    handlePlaidTransaction
};

