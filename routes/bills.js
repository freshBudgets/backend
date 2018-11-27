const mongoose         = require('mongoose');
const passport         = require('passport');
const crypto           = require('crypto');
const jwt              = require('jsonwebtoken');
const Bills            = mongoose.model("Bills")


module.exports = {
    addBill
};
