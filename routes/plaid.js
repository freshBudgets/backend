const plaid = require('plaid');
const mongoose = require('mongoose');
const moment = require('moment');
const sms = require('./sms');
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

const PlaidInstitution = mongoose.model('PlaidInstitutions');
const BudgetCategory = mongoose.model('BudgetCategory');
const Transactions = mongoose.model('Transactions');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_DEV_SECRET = process.env.PLAID_DEV_SECRET;
const PLAID_PUBLIC_ID = process.env.PLAID_PUBLIC_ID;
const PLAID_ENV = plaid.environments.development;
const plaidClient = new plaid.Client(PLAID_CLIENT_ID, PLAID_DEV_SECRET, PLAID_PUBLIC_ID, PLAID_ENV);

const SavedTransactions = mongoose.model('SavedTransactions');
const transactions = require('./transactions');

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

const getPlaidTransactions = function(req, res) {
    const today = moment().format('YYYY-MM-DD');
    const oneDayAgo = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    BudgetCategory.findOne({user: userID, budgetName: 'Uncategorized Transactions', isDeleted: false}, function(err, category) {
        const uncategorizedBudgetID = category._id;
        PlaidInstitution.findOne({user: userID}, (err, account) => {
            plaidClient.getTransactions(account.accessToken, oneDayAgo, today, async (err, result) => {
                let newTransactions = [];
                for(var i = 0; i < result.transactions.length; i++) {
                    transaction = result.transactions[i];
                    if(transaction.amount <= 0) {
                        continue;
                    }
                    const newTransaction = new Transactions();
                    newTransaction.amount = transaction.amount;
                    newTransaction.date = transaction.date;
                    newTransaction.name = transaction.name;
                    newTransaction.originalName = transaction.name;
                    newTransaction.user_id = userID;

                    
                    const query = SavedTransactions.findOne({userId: userID, name: transaction.name});
                    const queryResult = await query.exec();
                    console.log("query res: " + queryResult);
                    if(queryResult) {
                        newTransaction.budget_id = queryResult.budgetId;
                    }
                    else {
                        newTransaction.budget_id = uncategorizedBudgetID;
                    }  
                    newTransactions.push(newTransaction);
                }
                Transactions.insertMany(newTransactions, function(err) {
                    sms.sendTransactionSMSToUser(userID, uncategorizedBudgetID);
                     res.json({
                       data: result.transactions
                    });
                });
            });
        });
    });
};

const handlePlaidTransaction = function(req, res) {
    const params = req.body;
    twilioClient.messages.create({
        body: 'webhook hit' + params,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+12069140659'
      })
      .then(message => {
        console.log(message.sid);
        res.json({ messageID: message.sid });
      })
      .done();
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
    //res.json({success: true, message:"stub"});
};

module.exports = {
    linkPlaidAccount,
    handlePlaidTransaction,
    getPlaidTransactions
};



