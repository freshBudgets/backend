const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionsSchema = new Schema({
    amount: Number,
    date: Date,
    name: String,
    transaction_id: String,
    account_id: String
  });

mongoose.model('Transactions', TransactionsSchema);