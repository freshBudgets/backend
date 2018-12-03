const mongoose     = require('mongoose');
const passport     = require('passport');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const Users        = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const BudgetCategories = mongoose.model('BudgetCategory');
const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// adds a transaction to the Transactions collection
const addTransaction = function(req, res) {
    var params = req.body;
    req.body.date = new Date();
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.amount || !params.date || !params.name || !params.budget_id ) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }

    var newTransaction = new Transactions();
    newTransaction.amount = params.amount;
    newTransaction.date = params.date;
    newTransaction.name = params.name;
    newTransaction.budget_id = params.budget_id;
    newTransaction.user_id = userID;

    newTransaction.save(function(err){
        if (err){
            res.json({
                success: false,
                message: 'Could not add new transaction.'
            });
        }
        else{
            res.json({
                success: true,
                message: 'Successfully added transaction!'
            })
        }
    });
}

// updates an existing transaction
const updateTransaction = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    var fromPhoneNumber;
    Users.findOne({userID: userID}, function(err, user){
        fromPhoneNumber = user.phoneNumber;
    });

    //Check if all needed information is sent in request
    if(!params.transaction_id || !params.amount || !params.date || !params.name ) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }

    Transactions.findOne({_id: params.transaction_id}, function(err, transaction) {
        if(err) {
            res.json({
                success: false,
                message: 'Error finding transaction'
            });
        }  
        else if(transaction == null) {
            res.json({
                success: false,
                message: 'Transaction does not exist'
            });
        }
        else if(transaction.user_id != userID) {
            res.json({
                success: false,
                message: 'This user is not authorized to edit this transaction'
            });
        }
        else {
            transaction.amount = params.amount;
            transaction.date = params.date;
            transaction.name = params.name;
            if (params.currentBudget != params.newBudget) {
                BudgetCategories.findOne({_id: params.newBudget}, function(err, newBudget){
                    newBudget.currentAmount += transaction.amount;
                    newBudget.save(function(err) {
                        if(newBudget.currentAmount > newBudget.budgetLimit) {
                            twilioClient.messages.create({
                                body: 'Your budget: ' + newBudget.budgetName + 'has gone overbudget.',
                                from: process.env.TWILIO_PHONE_NUMBER,
                                to: '+1' + fromPhoneNumber
                              })
                              .then(message => {
                                console.log(message.sid);
                                res.json({ messageID: message.sid });
                              })
                              .done();
                        }
                        else if((newBudget.currentAmount*1.0)/newBudget.budgetLimit >= 0.75) {
                            twilioClient.messages.create({
                                body: 'Your budget: ' + newBudget.budgetName + ', is 75% or more to its limit. Watch your spending!',
                                from: process.env.TWILIO_PHONE_NUMBER,
                                to: '+1' + fromPhoneNumber
                              })
                              .then(message => {
                                console.log(message.sid);
                                res.json({ messageID: message.sid });
                              })
                              .done();
                        }
                    });
                });
                BudgetCategories.findOne({_id: params.currentBudget}, function(err, currentBudget){
                    currentBudget.currentAmount -= transaction.amount;
                    currentBudget.save();
                });
                transaction.budget_id = params.newBudget;
            }

            transaction.save(function(err) {
                if(err) {
                    res.json({
                        success: false,
                        message: 'Could not save transaction'
                    });
                }
                else{
                    res.json({
                        success: true,
                        message: 'Successfully saved transaction'
                    });
                }
            });
        }
    });
}

// removes transaction from Transactions collection
const removeTransaction = function(req, res) {
    var params = req.body;

    //Check if all needed information is sent in request
    if (!params.transaction_id) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
    }
    
    else {
        Transactions.findOne({_id :params.transaction_id}, function(err, transaction) {
            if(err) {
              res.json({
                success: false,
                message: 'Could not delete the transaction'
              });
            }
            else {
              transaction.isDeleted = true;
              transaction.save(function(err) {
                if (err) {
                  res.json({
                    success: false,
                    message: 'Could not delete the transaction'
                  });
                }
                res.json({
                  success: true,
                  message: 'Sucessfully deleted the transaction'
                });
              });
            }
          });
    }
}

// returns all transactions for a user
const getAll = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    Transactions.find({user_id: userID, isDeleted: false}, function(err, transactions) {
        if(transactions.length > 0) {
            res.json({
		success: true,
                transactions: transactions
            });
        }
        else {
            res.json({
                success: false,
                message: 'Could not find transactions for user'
            });
        }
    });
}


// returns all transactions from a specific budget for current user
const getFromBudget = function(req, res) {
    const params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    const budgetId = req.params.id;

    //Check if all needed information is sent in request
    if(!budgetId) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }
    
    Transactions.find({user_id: userID, budget_id: budgetId, isDeleted: false}, function(err, transactions) {
        if(transactions.length > 0) {
            res.json({
                success: true,
                transactions: transactions
            });
        }
        else {
            res.json({
                success: false,
                message: 'Could not find transactions for user'
            });
        }
    });
};

const getTransactionTime = function(req, res) {
    const cutoff = new Date();
    //const cutoff = '2017-10-29 00:00:00.000+00:00';
    const userID = req.decoded._id;
    const time = req.params.time;
    if (time === 'month'){
        //var cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth()-1);
        //
        Transactions.find({user_id: userID, date: {"$gt": cutoff}, isDeleted: false}, function(err, transaction_list){
            console.log('list: ' + transaction_list);
            if(err){
                res.json({
                    success: false,
                    message: 'Could not find transactions for user in this time scale'
                });
            }
            else{
                res.json({
                    success: true,
                    transaction_list: transaction_list
                });
            }
        });
    }
    else if (time === '6months'){
        //var cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth()-6);
        Transactions.find({user_id: userID, date: {"$gt": cutoff}, isDeleted: false}, function(err, transaction_list){
            if(err){
                res.json({
                    success: false,
                    message: 'Could not find transactions for user in this time scale'
                });
            }
            else{
                res.json({
                    success: true,
                    transaction_list: transaction_list
                });
            }
        });
    }
    //last is year
    else {
        //var cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth()-12);
        Transactions.find({user_id: userID, date: {"$gt": cutoff}, isDeleted: false}, function(err, transaction_list){
            if(err){
                res.json({
                    success: false,
                    message: 'Could not find transactions for user in this time scale'
                });
            }
            else{
                res.json({
                    success: true,
                    transaction_list: transaction_list
                });
            }
        });
    }
}

module.exports = {
    addTransaction,
    removeTransaction,
    updateTransaction,
    getAll,
    getFromBudget,
    getTransactionTime
};
