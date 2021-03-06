const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BudgetCategorySchema = new Schema({
    userID: String,
    budgetName: String,
    budgetLimit: Number,
    currentAmount: Number,
    user: {type: Schema.Types.ObjectId, ref: 'Users'},
    isDeleted: {type: Boolean, default: false}
  });

mongoose.model('BudgetCategory', BudgetCategorySchema);