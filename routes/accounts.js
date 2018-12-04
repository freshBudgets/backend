const mongoose     = require('mongoose');
const PlaidInstituions = mongoose.model('PlaidInstitutions');

const getAll = function(req, res) {
  PlaidInstituions.find({ user: {_id: req.decoded._id}}, function(err, accounts) {
    if (err) {
      res.json({success: false});
      return;
    }

    res.json({success: true, accounts})   ;
  })
}

module.exports = {
    getAll,
};
