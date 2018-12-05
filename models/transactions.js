const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
    amount: Number,
    date: Date,
    name: String,
    originalName: String,
    budget_id: String,
    user_id: String,
    isDeleted: {type: Boolean, default: false}
  });

mongoose.model('Transactions', TransactionsSchema);
