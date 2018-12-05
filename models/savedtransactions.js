const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SavedTransactionsSchema = new Schema({
    name: String,  
    budgetId: String,
    userId: String,
    isDeleted: {type: Boolean, default: false}
  });

mongoose.model('SavedTransactions', SavedTransactionsSchema);
