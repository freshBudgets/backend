const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BillsSchema = new Schema({
    day_of_month: Number,
    name: String,
    user_id: String,
    is_deleted: {type: Boolean, default: false}
  });

mongoose.model('Bills', BillsSchema);
