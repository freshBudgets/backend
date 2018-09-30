const plaid = require('plaid');
const mongoose = require('mongoose');

const PlaidInstitution = mongoose.model('PlaidInstitutions');

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
        const itemID = result.item_id;
        var plaidAccount = new PlaidInstitution({
            accessToken: accessToken,
            accountIDs: accountIDs,
            itemId: itemID,
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
    // const params = req.body;
    // if (params.webhook_code == "DEFAULT UPDATE" && params.webhook_type == "TRANSACTIONS") {
    //     PlaidInstitution.findOne({itemID: params.item_id}, function(err, plaid) {
    //         const now = moment().format('YYYY-MM-DD');
    //         const yesterday = now.subtract(1, 'days').format('YYYY-MM-DD');
    //         plaidClient.getTransactions(plaidAccount.accessToken, yesterday, now, {
    //             count: params.new_transactions
    //         }).then(result => {
                
    //         });
    //     });
    // } 
    //map transaction to an account

    //see if account is associated with a user

    //text user about transaction

    //get response from user, handle updating budget

    //STUBBED FOR NOW
    res.json({success: true, message:"stub"});
};

module.exports = {
    linkPlaidAccount,
    handlePlaidTransaction
};

