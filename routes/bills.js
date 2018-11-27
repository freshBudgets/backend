const mongoose         = require('mongoose');
const passport         = require('passport');
const crypto           = require('crypto');
const jwt              = require('jsonwebtoken');
const Bills            = mongoose.model("Bills")

// adds a bill to the bills collection
const addBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    // check if all needed information is sent in request
    if(!params.day_of_month || !params.name) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }

    // if day of month is less than 1 or greater than 31 return error
    if(params.day_of_month <= 0 || params.day_of_month > 31) {
        res.json({
            success: false,
            message: 'Incorrect day of month'
        });
        return;
    }

    var newBill = new Bills(); 
    newBill.name = params.name;
    newBill.day_of_month = params.day_of_month;
    newBill.user_id = userID;

    newBill.save(function(err){
        if (err){
            res.json({
                success: false,
                message: 'Could not add new bill.'
            });
        }
        else{
            res.json({
                success: true,
                message: 'Successfully added bill!'
            })
        }
    });
}

// updates a bill
const updateBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.bill_id || !params.day_of_month || !params.name) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }

    // if day of month is less than 1 or greater than 31 return error
    if(params.day_of_month <= 0 || params.day_of_month > 31) {
        res.json({
            success: false,
            message: 'Incorrect day of month'
        });
        return;
    }

    // find bill in Bills collection
    Bills.findOne({_id: params.bill_id}, function(err, bill) {
        if(err) {
            res.json({
                success: false,
                message: 'Error finding bill'
            });
        }  
        else if(bill == null) {
            res.json({
                success: false,
                message: 'Bill does not exist'
            });
        }
        else if(bill.user_id != userID) {
            res.json({
                success: false,
                message: 'This user is not authorized to edit this bill'
            });
        }
        else {
            bill.name = params.name;
            bill.day_of_month = params.day_of_month;

            bill.save(function(err) {
                if(err) {
                    res.json({
                        success: false,
                        message: 'Could not save bill'
                    });
                }
                else{
                    res.json({
                        success: true,
                        message: 'Successfully saved bill'
                    });
                }
            });
        }
    });
}

// remove a bill from the bills collection
const removeBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.bill_id) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }


    // find bill in Bills collection
    Bills.findOne({_id: params.bill_id}, function(err, bill) {
        if(err) {
            res.json({
                success: false,
                message: 'Error finding bill'
            });
        }  
        else if(bill == null) {
            res.json({
                success: false,
                message: 'Bill does not exist'
            });
        }
        else if(bill.user_id != userID) {
            res.json({
                success: false,
                message: 'This user is not authorized to delete this bill'
            });
        }
        else {
            bill.is_deleted = true;
    
            bill.save(function(err) {
                if(err) {
                    res.json({
                        success: false,
                        message: 'Could not delete bill'
                    });
                }
                else{
                    res.json({
                        success: true,
                        message: 'Successfully deleted bill'
                    });
                }
            });
        }
    });
}

// checks if there are any bills coming up. If there are, email user
const checkBills = function(req, res) {
    return;
}

module.exports = {
    addBill,
    updateBill,
    removeBill,
    checkBills
};
