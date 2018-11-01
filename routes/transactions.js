const mongoose     = require('mongoose');
const passport     = require('passport');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const Users        = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const Budgets = mongoose.model('BudgetCategory');
const mongoURI     = process.env.MONGO_URI;
const jwtSecret    = process.env.JWT_SECRET;

// adds a transaction to the Transactions collection
const addTransaction = function(req, res) {
    var params = req.body;
    req.body.date = new Date();
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.amount || !params.date || !params.name || !params.budget_id) {
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

    console.log("start update\n");

    //Check if all needed information is sent in request
    if(!params.transaction_id || !params.amount || !params.date || !params.name || !params.budget_id) {
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
            transaction.budget_id = params. budget_id;

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
        Transactions.findOne({_id :budgetID, user:userID}, function(err, transaction) {
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
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!budget_id) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }
    
    Transactions.find({user_id: userID, budget_id: params.budget_id, isDeleted: false}, function(err, transactions) {
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

const spendingHabits = function(req, res) {
    console.log('in here');
    const cutoffMonth = new Date();
    cutoffMonth.setMonth(cutoffMonth.getMonth()-6);
    const userID = req.decoded._id;
    let total = 0.00;

    Transactions.find({user_id: userID, date: {"$gt": cutoffMonth}, isDeleted: false}, async function(err, transaction_list){
        for(let i = 0; i < transaction_list.length; i++){
        //console.log('transactionName in for loop: ' + transaction_list[i].name);
            total = total + transaction_list[i].amount;
        }
        total = total/6.0;
        total = total.toFixed(2);
        //console.log('after for loop total: ' + total);
        if(err){
            res.json({
                success: false,
                message: 'Could not find budgets for user'
            });
        }
        else{
            res.json({
                success: true,
                SpendingAverages: total
            });
        }
    });
}

module.exports = {
    addTransaction,
    removeTransaction,
    updateTransaction,
    getAll,
    getFromBudget,
    spendingHabits
}
