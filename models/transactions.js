const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
    amount: Number,
    date: Date,
    name: String,
    budget_id: String,
    user_id: String
  });

mongoose.model('Transactions', TransactionsSchema);
