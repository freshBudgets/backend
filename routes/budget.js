//for categories, not sure about this
const mongoose = require('mongoose');
const BudgetCategories = mongoose.model('BudgetCategory');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');
var async = require('async');
const User = mongoose.model('Users');

const getAll = (req, res) => {
  const userID = req.decoded._id;
  BudgetCategories.find({user:userID, isDeleted: false}, function(err, ret) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not get budgets for this user'
      });
    }
    else {
      res.json({
        success: true,
        budgets: ret,
        message: 'Got all budgets for this user'
      });
    }
  });
}

const getOne = (req, res) => {
  const userID = req.decoded._id;
  const budgetID = req.params.id;
  console.log('budgetID: ' + budgetID);
  BudgetCategories.findOne({_id:budgetID, user:userID, isDeleted: false}, function(err, ret) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not get the budget for this user'
      });
    }
    else {
      res.json({
        success: true,
        budgets: ret,
        message: 'Got the budget for this user'
      });
    }
  });
}

var createCategory = function(req, res) {
  //Variables from the request body
  const userID = req.decoded._id;
  const budgetName = req.body.budgetName;
  const budgetLimit = req.body.budgetLimit;

  //Set values for new Budget Category object
  var budgetCategory = new BudgetCategories();
  budgetCategory.userID = userID;
  budgetCategory.budgetName = budgetName;
  budgetCategory.budgetLimit = budgetLimit;
  budgetCategory.currentAmount = 0;
  budgetCategory.user = mongoose.Types.ObjectId(req.decoded._id);
  // console.log("budget name: " + budgetCategory.budgetName);

  //Save budget to database
  budgetCategory.save(function(err, createdBudget){
    if (err){
      res.json({
        success: false,
        message: 'Could not save user with new budget'
      });
    }
    else{
      res.json({
        budgetID: createdBudget._id,
        success: true,
        message: 'Successfully added new budget category!'
      })
    }
    });
}

var editCategory = function(req, res) {
  //Variables from the request body
  const userID = req.decoded._id;
  const budgetID = req.body.budgetID;
  const newBudgetName = req.body.newBudgetName;
  const newBudgetLimit = req.body.newBudgetLimit;

  //Find buget from array of existing budget categories
  //
  BudgetCategories.findOne({_id:budgetID, user:userID}, function(err, budgetCategory) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not find the budget for this user'
      });
    }
    // console.log("budget category: " + budgetCategory);
    budgetCategory.budgetName = newBudgetName;
    budgetCategory.budgetLimit = newBudgetLimit;
    budgetCategory.save(function(err){
      if(err) {
        res.json({
          success: false,
          message: 'Could not save budget changes'
        });
      }
      else {
        res.json({
          success: true,
          message: 'Sucessfully saved new values to the database'
        });
      }
    });
  });
}

var deleteCategory = function(req, res) {
  const userID = req.decoded._id;
  const budgetID = req.body.budgetID;
  BudgetCategories.findOne({_id :budgetID, user:userID}, function(err, budget) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not delete the budget category'
      });
    }
    else {
      budget.isDeleted = true;
      budget.save(function(err) {
        if (err) {
          res.json({
            success: false,
            message: 'Could not delete the budget category'
          });
        }
        res.json({
          success: true,
          message: 'Sucessfully deleted the budget category'
        });
      });
    }
  });
}

function getTransactionsForPastMonth(id, userID) {
  let cutoff = moment().subtract(4,'Weeks');
  console.log(cutoff);
  console.log(new Date());
  return new Promise((resolve, reject) => {
    Transactions.find({user_id:  userID, budget_id: id, isDeleted: false, date: {"$gt": cutoff}}, function(err, transactions) {
      //console.log(transactions);
      if (err) {
        reject(err);
      } else {
        resolve(transactions);
      }
    })
  })
}

var monthlyReport = function(req, res) {
  const userID = req.decoded._id;

  BudgetCategories.find({user:userID, isDeleted: false}, async function(err, budgetCategories) {
    if(err) {
      res.json({ success: false, message: 'Could not get budgets for this user' });
      return;
    }

    let bs = [];

    for (let i = 0; i < budgetCategories.length; i++) {
      const budget = budgetCategories[i]._doc;
      const transactions = await getTransactionsForPastMonth(budget._id, userID) || [];
      const b = { ...budget };
      b.transactions = transactions;

      let sum = 0;
      for (let i = 0; i < transactions.length; i++) {
        sum += transactions[i].amount;
      }
      b.sum = sum;
      
      bs.push(b);
    }
    res.json({success: true, budgets: bs});
  });
}
module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
  getAll,
  getOne,
  monthlyReport
};