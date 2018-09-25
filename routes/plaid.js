const plaid = require('plaid');
const mongoose = require('mongoose');

const User = mongoose.model('Users');
const PlaidInstitution = mongoose.model('PlaidInstitutions');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID_SB;
const PLAID_DEV_SECRET = process.env.PLAID_DEV_SECRET_SB;
const PLAID_PUBLIC_ID = process.env.PLAID_PUBLIC_ID_SB;
const PLAID_ENV = plaid.environments.sandbox;
const plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_DEV_SECRET, PLAID_PUBLIC_ID, PLAID_ENV);

const linkPlaidAccount = function(req, res) {
    const userID = req.decoded._id;
    const accountIDs = req.body.accountIDs;
    const publicToken = req.body.publicToken;
   
    plaidClient.exchangePublicToken(publicToken, function(err, res) {
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
        User.findById(userID, function(err, user) {
            var plaidInstitution = new PlaidInstitution();
            plaidInstitution.accessToken = accessToken;
            plaidInstitution.accountIDs = accountIDs;
            user.plaidInstitutions.push(plaidInstitution);
            user.save(function(err){
                if (err) {
                    res.json({
                        success: false,
                        message: 'Plaid Institution failed to be saved to user.'
                    });
                }
                else {
                    res.json({
                      success: true,
                      message: "Plaid Institution successfully saved to user",
                    });
                  }
            });
        });
    });
    
    res.json('req');
};

const handlePlaidTransaction = function(req, res) {
    res.json({success: true, message:"stub"});
};

module.exports = {
    linkPlaidAccount,
    handlePlaidTransaction
};

