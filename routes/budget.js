//for categories, not sure about this
const mongoose = require('mongoose');
const BudgetCategories = mongoose.model('BudgetCategory');
const Transactions = mongoose.model('Transactions');
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

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  // Get first day of year
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  // Calculate full weeks to nearest Thursday
  var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
  // Return array of year and week number
  return [d.getUTCFullYear(), weekNo];
}

const setBudget = function(req, res) {
  const userID = req.decoded._id;
  const budgetID = req.params.id;
  //console.log('budget id: ' + budgetID);
  const cutoff = getWeekNumber(new Date());
  //cutoff.setMonth((new Date()).getMonth()-1);
  BudgetCategories.findOne({_id: budgetID, user: userID, isDeleted: false}, function(err, budget){
      if(err){
          console.log('ERROR');
      }
      //console.log('budget id2: ' + budget);
      Transactions.find({budget_id: budget._id, user_id: userID, isDeleted: false}, function(err, transaction_list){
          //console.log('list: ' + transaction_list);
          budget.currentAmount = 0;
          for(var i = 0; i < transaction_list.length; i++){
              const transactionDate = getWeekNumber(transaction_list[i].date);
              console.log('transaction name: ' + transaction_list[i].name);
              console.log('transaction date: ' + transactionDate);
              console.log('transaction cutoff: ' + cutoff);
              console.log('===: ' + transactionDate===cutoff)
              if(transactionDate[1] === cutoff[1] && transactionDate[0] === cutoff[0]){
                  console.log('in here');
                  budget.currentAmount = budget.currentAmount + transaction_list[i].amount;
              }
          }
          if(err){
              res.json({
                  success: false,
                  message: 'Could not find transactions for user in this time scale'
              });
          }
          else{
              res.json({
                  success: true,
                  updatedBudget: budget
              });
          }
      });
  });
}

module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
  getAll,
  getOne,
  setBudget
};
