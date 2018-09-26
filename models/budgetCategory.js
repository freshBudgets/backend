const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BudgetCategorySchema = new Schema({
    userID: String,
    budgetName: String,
    budgetLimit: Number,
    currentAmount: Number,
    //transactions[]: Array
  });

mongoose.model('BudgetCategories', BudgetCategorySchema);