const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BillsSchema = new Schema({
    date: Date,
    name: String,
    user_id: String,
    isDeleted: {type: Boolean, default: false}
  });

mongoose.model('Bills', BillsSchema);
