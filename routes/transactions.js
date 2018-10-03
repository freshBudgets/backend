const mongoose     = require('mongoose');
const passport     = require('passport');
const crypto       = require('crypto');
const jwt          = require('jsonwebtoken');
const Users        = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const mongoURI     = process.env.MONGO_URI;
const jwtSecret    = process.env.JWT_SECRET;

const addTransaction = function(req, res) {
    var params = req.body; 

    const userID = mongoose.Types.ObjectId(req.decoded._id);
    const transactionID = params.transactionID;

    Transactions.findOne({name:'Nike store'}, function(err, transaction) {
        if(err) {
            res.json({
                success: false,
                message: 'Transaction not found'
            });
        }
        else {
            res.json({
                _id: transaction._id,
                date: transaction.date,
                name: transaction.name,
                budget_id: transaction.budget_id
            });
        }
    });
}


module.exports = {
    addTransaction,
    // removeTransaction,
    // getAll,
    // getMatching,
    // updateTransaction
}
