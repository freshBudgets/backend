const mongoose   = require('mongoose');
const passport   = require('passport');
const crypto     = require('crypto');
const jwt        = require('jsonwebtoken');
const Bills      = mongoose.model("Bills");
const Users      = mongoose.model("Users");
const async      = require('async');
const cron       = require('node-cron')
const nodemailer = require('nodemailer')

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
    const billId = req.params.id;

    //Check if all needed information is sent in request
    if(!params.dayOfMonthDue || !params.name) {
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
    Bills.findOne({_id: billId}, function(err, bill) {
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
    const billId = req.params.id;

    // find bill in Bills collection
    Bills.findOne({_id: billId}, function(err, bill) {
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

// returns all bills
const getAll = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);

    Bills.find({userId: userID, isDeleted: false}, function(err, bills) {
        if(err) {
            res.json({
                success: false,
                message: "Error finding bills"
            });
        }
        else {
            res.json({
                success: true,
                bills: bills
            });
        }
    });
}


// Runs checkbills every day of the week
/* cron.schedule('* * * * Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', () => { */
cron.schedule('* * * * Sunday,Monday,Tuesday,Wednesday,Thursday,Friday', () => {
    Users.find({}, function(err, users) {
        async.each(users, function(user, err) {
            checkBills(user._id);
        })
    });
});

// actual route/endpoint to hit to manually check bills
const checkBillsRoute = function(req, res) {
    const userID = mongoose.Types.ObjectId(req.decoded._id);
    checkBills(userID);
    res.json({});
}

// checks if there are any bills coming up. If there are, email user
const checkBills = function(userID) {
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
        async.each(bills, async function(bill, err) {
            if(bill.isDeleted != true) {
                if(bill.dayOfMonthDue < currentDay) {
                    remaining = daysInMonth - currentDay + bill.dayOfMonthDue;
                }
                else if(bill.dayOfMonthDue >= currentDay) {
                    remaining = bill.dayOfMonthDue - currentDay;
                }

                if(remaining < 4) {
                    const query = Users.findOne({_id: userID});
                    const queryResult = await query.exec();
                    sendMail(queryResult.email, bill.name, remaining);
                }
            }
        });
    });
    return;
}



const sendMail = function(userEmail, name, remaining) {
    let transporter = nodemailer.createTransport({
        service: 'gmail', 
        secure: false,
        port: 25,
        auth: {
            user: 'freshbudgets@gmail.com',
            pass: 'thefreshest'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    let HelperOptions = {
        from: 'Fresh Budgets <freshbudgets@gmail.com>',
        to: userEmail,
        subject: 'Upcoming bill due date',
        text: 'Your bill for \'' + name + '\' is due in ' + remaining + ' days.'
    };

    transporter.sendMail(HelperOptions, (error, info) => {
        if(error) {
            return console.log(error);
        }
        console.log("The message was sent");
        console.log(info)
    });
}


module.exports = {
    addBill,
    updateBill,
    removeBill,
    getAll, 
    checkBills,
    checkBillsRoute,
    sendMail
};
