//for categories, not sure about this
const mongoose = require('mongoose');
const BudgetCategories = mongoose.model('BudgetCategories');
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
  const userID = req.decoded._id;
  const budgetName = req.body.budgetName;
  const budgetLimit = req.body.budgetLimit;

  User.findById(userID, function(err, user) {
    if (err){
      res.json({
        success: false,
        message: 'Could not find the user'
      });
    }
    var budgetCategory = new BudgetCategories();
    budgetCategory.userID = userID;
    budgetCategory.budgetName = budgetName;
    budgetCategory.budgetLimit = budgetLimit;
    budgetCategory.currentAmount = 0;
    user.budgetCategories.push(budgetCategory);
    user.save(function(err){
      if (err){
        res.json({
          success: false,
          message: 'Could not save user with new budget'
        });
      }
      else{
        res.json({
          success: true,
          message: 'Successfully added new budget category!'
        })
      }
      });
  });
}
var createCategory = function(req, res) {
  //limit or ID? tak to cole about this
  budgetID = req.body.budgetID
  newName
  BudgetCategories.findById(budgetID, function(err, budget) {
    budget.budgetName = newName;
    budget
  }
});
var functions = {

}

module.exports = { getAll, getOne };
