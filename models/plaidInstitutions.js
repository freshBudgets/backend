const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlaidInstitutionsSchema = new Schema({
    accessToken: String,
    accountIDs: [String],
    itemID: String,
    user: {type: Schema.Types.ObjectId, ref: 'Users'}
  });

mongoose.model('PlaidInstitutions', PlaidInstitutionsSchema);