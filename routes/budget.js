//for categories, not sure about this
const mongoose = require('mongoose');
const BudgetCategories = mongoose.model('BudgetCategory');
const User = mongoose.model('Users');

const getAll = (req, res) => {
  res.json({
    success: true,
    total: {
      spent: 54.78,
      total: 75.00
    },
    budgets: {
      1: {
        id: 1,
        name: 'Food',
        total: 25.00,
        spent: 19.56
      },
      2: {
        id: 2,
        name: 'Gas',
        total: 50.00,
        spent: 35.22
      },
      3: {
        id: 3,
        name: 'Alcohol',
        total: 300.00,
        spent: 354.00
      },
      4: {
        id: 4,
        name: 'Car Parts',
        total: 100.00,
        spent: 34.12
      }
    }
  })
}

const getOne = (req, res) => {
  let data = {
    success: true,
  }

  data[req.params.id] = {
      id: req.params.id,
      name: 'Food',
      total: 25.00,
      spent: 19.56,
      transactions: [
        {
          from: 'Payless',
          amount: 4.56
        },
        {
          from: 'Walmart',
          amount: 5.54,
        },
        {
          from: 'Target',
          amount: 9.21
        }, {
          from: 'BP',
          amount: .25
        }
      ]
    }
  res.json(data)
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
  BudgetCategories.deleteOne({_id :budgetID, user:userID}, function(err) {
    if(err) {
      res.json({
        success: false,
        message: 'Could not delete the budget category'
      });
    }
    else {
      res.json({
        success: true,
        message: 'Sucessfully deleted the budget category'
      });
    }
  });
}

module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
  getAll,
  getOne
};
