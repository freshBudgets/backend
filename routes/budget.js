//for categories, not sure about this
const mongoose = require('mongoose');
const BudgetCategories = mongoose.model('BudgetCategory');
const Transactions = mongoose.model('Transactions');
var moment = require('moment');
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

var findWeeksInMonth = function(date){
  let month = moment(date).subtract(1, 'M');
  month = moment(month).startOf('month');
  let days = 0;
  while (moment(month).format("M") < moment(date).format("M")) {
    month = moment(month).add(1, 'days');
    days++;
  }
  return days/7.0;
}

var monthlyReport = function(req, res) {
  const userID = req.decoded._id;
  let total = 0
  let budgetTotals = [];
  BudgetCategories.find({user:userID, isDeleted: false}, function(err, budgetCategories) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not get budgets for this user'
      });
    }
    else {
      //console.log('budgetlist: ' + budgetCategories);
      for(let i = 0; i < budgetCategories.length; i++){
        Transactions.find({user_id:userID, budget_id:budgetCategories[i]._id, isDeleted: false}, function(err, transactions) {
          if(err) {
            res.json({
              success: false,
              message: 'Could not get transactions for this users budget'
            });
          }
          else {
            //console.log('transactions: ' + transactions);
            for(let n = 0; n < transactions.length; n++){
              //console.log('date 1: ' + moment(transactions[i].date).format("M"));
              
              let date = moment(new Date()).subtract(1,'months').format("M");
              
              //console.log("date 2: " + date);
              if(moment(transactions[i].date).format("M") === date){
                total = total + transactions[i].amount;
                //console.log('in here: ' + total);
              }
            }
            total = total/findWeeksInMonth(new Date());
            budgetTotals.push({budget_id: budgetCategories[i]._id, average_weekly_spending: total});
            //console.log('pushed: ' + budgetTotals[0].average_weekly_spending);
            total = 0;
          }
        });
      }
      console.log('totals: ' + budgetTotals);
      res.json({
        success: true,
        budgetList: budgetTotals
      });
    }
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