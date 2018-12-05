const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BillsSchema = new Schema({
    dayOfMonthDue: Number,
    name: String,
    userId: String,
    isDeleted: {type: Boolean, default: false}
  });

mongoose.model('Bills', BillsSchema);
