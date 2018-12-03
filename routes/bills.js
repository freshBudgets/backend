const mongoose   = require('mongoose');
const passport   = require('passport');
const crypto     = require('crypto');
const jwt        = require('jsonwebtoken');
const Bills      = mongoose.model("Bills")
const nodemailer = require('nodemailer');
const async      = require('async');

// adds a bill to the bills collection
// TESTED
const addBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    
    // check if all needed information is sent in request
    if(!params.dayOfMonthDue || !params.name) {
        res.json({
            success: false,
            message: 'Not enough information to add bill'
        });
        return;
    }

    // if day of month is less than 1 or greater than 31 return error
    if(params.dayOfMonthDue <= 0 || params.dayOfMonthDue > 31) {
        res.json({
            success: false,
            message: 'Invalid day of month'
        });
        return;
    }

    var newBill = new Bills(); 
    newBill.name = params.name;
    newBill.dayOfMonthDue = params.dayOfMonthDue;
    newBill.userId = userID;

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
// TESTED 
const updateBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.billId || !params.dayOfMonthDue || !params.name) {
        res.json({
            success: false,
            message: 'Not enough information to update settings'
        });
        return;
    }

    // if day of month is less than 1 or greater than 31 return error
    if(params.dayOfMonthDue <= 0 || params.dayOfMonthDue > 31) {
        res.json({
            success: false,
            message: 'Incorrect day of month'
        });
        return;
    }

    // find bill in Bills collection
    Bills.findOne({_id: params.billId}, function(err, bill) {
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
        else if(bill.userId != userID) {
            res.json({
                success: false,
                message: 'This user is not authorized to edit this bill'
            });
        }
        else {
            bill.name = params.name;
            bill.dayOfMonthDue = params.dayOfMonthDue;

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
// sets bill's isDeleted value to false
// TESTED
const removeBill = function(req, res) {
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    //Check if all needed information is sent in request
    if(!params.billId) {
        res.json({
            success: false,
            message: 'Not enough information to remove bill'
        });
        return;
    }


    // find bill in Bills collection
    Bills.findOne({_id: params.billId}, function(err, bill) {
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
        else if(bill.userId != userID) {
            res.json({
                success: false,
                message: 'This user is not authorized to delete this bill'
            });
        }
        else {
            bill.isDeleted = true;
    
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
    var params = req.body;
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    var remaining;

    var daysInMonth;
    // sets the daysInMonth variable according to the current month
    if(currentMonth == 1 
        || currentMonth == 3 
        || currentMonth == 5 
        || currentMonth == 7 
        || currentMonth == 8
        || currentMonth == 10
        || currentMonth == 12)
        daysInMonth = 30;
    else if(currentMonth == 4
        || currentMonth == 6
        || currentMonth == 9
        || currentMonth == 11)
        daysInMonth = 31;
    else if(currentMonth == 2)
        daysInMonth = 28;

    Bills.find({userId: userID}, function(err, bills) {
        async.each(bills, function(bill, err) {
            if(bill.isDeleted != true) {
                if(bill.dayOfMonthDue < currentDay) {
                    remaining = daysInMonth - currentDay + bill.dayOfMonthDue;
                }
                else if(bill.dayOfMonthDue >= currentDay) {
                    remaining = bill.dayOfMonthDue - currentDay;
                }

                // Nothing else happens here
                console.log("todays date: " + currentDay);
                console.log("bill due date: " + bill.dayOfMonthDue);
                console.log("remaining: " + remaining);
            }
        });
    });

    res.json({});
    
    return;
}


// does nothing right now
const testMail = function(req, res) {
    var transporter = nodemailer.createTransport({
        service: 'AOL',
        auth: {
            user: 'freshbudgest@aol.com',
            pass: 'RNcJZzB5'
        }
    });

    var mailOptions = {
        from: 'freshbudgest@aol.com',
        to: 'kylepollina@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    }); 

    res.json({});

    return;
}

module.exports = {
    addBill,
    updateBill,
    removeBill,
    checkBills
};
