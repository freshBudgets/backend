const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PlaidInstitutionsSchema = new Schema({
    accessToken: String,
    accountIDs: [String]
  });

mongoose.model('PlaidInstitutions', PlaidInstitutionsSchema);