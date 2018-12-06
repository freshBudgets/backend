const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const mongoose = require('mongoose');
const Users = mongoose.model('Users');
const Transactions = mongoose.model('Transactions');
const BudgetCategories = mongoose.model('BudgetCategory');

const sendTestSMS = function(req,res){
  console.log(req.body);
  twilioClient.messages.create({
      body: 'whats up this is a freshbudgets twilio test',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + req.body.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done();
};

const receiveSMS = function(req, res) {
  const messageBody = req.body.Body.trim().split(" ");
  const fromPhoneNumber = parseInt(req.body.From.substring(2));
  console.log(messageBody);
  if(messageBody.length == 1 && messageBody[0].toLowerCase() != "commands") {
    handleNewTransaction(messageBody[0], fromPhoneNumber);
  }
  else if(messageBody.length == 1 && messageBody[0].toLowerCase() == "commands") {
    handleSendCommands(fromPhoneNumber);
  }
  else if(messageBody.length == 4 && messageBody[0].toLowerCase() == "create" && messageBody[1].toLowerCase() == "budget") {
    handleCreateNewBudget(messageBody, fromPhoneNumber);
  }
  else if(messageBody.length == 3 && messageBody[0].toLowerCase() == "delete" && messageBody[1].toLowerCase() == "budget") {
    handleDeleteBudget(messageBody, fromPhoneNumber);
  }
  else if(messageBody.length == 2 && messageBody[0].toLowerCase() == "budget" && messageBody[1].toLowerCase() == "summary") {
    handleGeneralBudgetSummary(messageBody, fromPhoneNumber);
  }
  else if(messageBody.length == 3 && messageBody[0].toLowerCase() == "budget" && messageBody[1].toLowerCase() == "summary") {
    handleSpecificBudgetSummary(messageBody, fromPhoneNumber);
  }
  else{
    twilioClient.messages.create({
      body: 'Not a valid command. Text "commands" to recieve a list of supported commands.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + fromPhoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done();
    res.end();
  }
};

const handleGeneralBudgetSummary = function(messageBody, fromPhoneNumber) {
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    let summaryString = "";
    BudgetCategories.find({userID: userID, isDeleted: false}, function(err, budgets) {
       for(let i = 0; i < budgets.length; i++) {
         const budget = budgets[i];
         summaryString.concat("Budget: " + budget.budgetName + " - Spent: $" + budget.currentAmount + "Limit: $" + budget.budgetLimit +"\n");
       }
    }).then(twilioClient.messages.create({
      body: summaryString,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + fromPhoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done());
  });
};

const handleSpecificBudgetSummary = function(messageBody, fromPhoneNumber) {
  const budgetName = messageBody[2];
  let summaryString = "";
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    BudgetCategories.find({userID: userID, budgetName: budgetName, isDeleted: false}, function(err, budget) {
      if(budget) {
        summaryString = "Budget: " + budget.budgetName + " - Spent: $" + budget.currentAmount + "Limit: $" + budget.budgetLimit;
      }
      else {
        summaryString = "Budget: " + budgetName + " not found." 
      }
    }).then(twilioClient.messages.create({
      body: summaryString,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + fromPhoneNumber
    })
    .then(message => {
      console.log(message.sid);
      res.json({ messageID: message.sid });
    })
    .done());
  });
};

const handleDeleteBudget = function(messageBody, fromPhoneNumber) {
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    const budgetName = messageBody[2];
    BudgetCategories.findOne({budgetName: budgetName, isDeleted: false}, function(err, budget) {
      if (!budget) {
        twilioClient.messages.create({
          body: 'Budget ' + budget.budgetName + ' could not be found. Nothing was deleted.',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: '+1' + fromPhoneNumber
        })
        .then(message => {
          console.log(message.sid);
          res.json({ messageID: message.sid });
        })
        .done();
      }
      else {
        budget.isDeleted = true;
        budget.save().then(twilioClient.messages.create({
          body: 'Budget ' + budget.budgetName + ' was deleted successfully.',
          from: process.env.TWILIO_PHONE_NUMBER,
          to: '+1' + fromPhoneNumber
        })
        .then(message => {
          console.log(message.sid);
          res.json({ messageID: message.sid });
        })
        .done())
      }
    });
  });
};

const handleCreateNewBudget = function(messageBody, fromPhoneNumber) {
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    const newBudget = new BudgetCategories();
    newBudget.userID = userID;
    newBudget.budgetName = messageBody[2];
    newBudget.budgetLimit = parseInt(messageBody[3]);
    newBudget.currentAmount = 0;
    newBudget.user = userID;
    newBudget.save(function(err) {
      twilioClient.messages.create({
        body: 'Budget ' + newBudget.budgetName + ' created successfully with a limit of $' + newBudget.budgetLimit + ' dollars.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+1' + fromPhoneNumber
      })
      .then(message => {
        console.log(message.sid);
        res.json({ messageID: message.sid });
      })
      .done();
    });
  });
};

const handleNewTransaction = function(budgetName, fromPhoneNumber) {
  Users.findOne({phoneNumber: fromPhoneNumber}, function(err, user) {
    const userID = user._id;
    BudgetCategories.findOne({budgetName: budgetName, user: userID, isDeleted: false}, function(err, budget) {
      Transactions.findOne({_id: user.lastTextedTransaction}, function(err, transaction) {
        transaction.budget_id = budget._id;
        budget.currentAmount += transaction.amount;
        transaction.save(function(err) {
          budget.save(function(err) {
            BudgetCategories.findOne({budgetName: 'Uncategorized Transactions', user: userID}, function(err, uncategorizedBudget) {
              sendTransactionSMSToUser(userID, uncategorizedBudget._id);
            });
          });
        });
      });
    });
  });
};

const handleSendCommands = function(fromPhoneNumber){
  twilioClient.messages.create({
    body: 'List of SMS commands freshBudgets supports.\n' + 
          'create budget [budgetName] [budgetLimit]\n' +
          'delete budget [budgetName]\n' +
          'budget summary\n' +
          'budget summary [budgetName]',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1' + fromPhoneNumber
  })
  .then(message => {
    console.log(message.sid);
    res.json({ messageID: message.sid });
  })
  .done();
};

const sendSMSVerificationCode = function(phoneNumber, verificationCode) {
  twilioClient.messages.create({
    body: 'Your Fresh Budgets verification code is: ' + verificationCode,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: '+1' + phoneNumber
  })
  .then(message => {
    console.log(message.sid);
  })
  .done();
};

const verifySMSVerificationCode = function(req, res) {
  const userID = req.decoded._id;
  Users.findOne({_id: userID}, function(err, user){
    if (err) {
      res.json({
        success: false,
        message: 'failed to find user'
      });
    }
    else {
      if (parseInt(req.body.verificationCode) != user.smsVerificationCode) {
        res.json({
          success: false,
          message: 'verification code does not match'
        });
      }
      else {
        user.isVerified = true;
        user.save();
        res.json({
          success: true,
          message: 'phone number verified'
        });
      }
    }
  });
};

const sendTransactionSMSToUser = function(userID, budgetID) {
  var transaction;
  Transactions.find({user_id: userID, budget_id: budgetID}, function(err, transactions) {
    transaction = transactions[0];
   Users.findOne({_id: userID}, function(err, user){
    twilioClient.messages.create({
      body: 'Fresh Budgets received a new Transaction!\n' + 
      'Name: ' + transaction.name + '\n' +
      'Amount: ' + transaction.amount + '\n' +
      'Date: ' + transaction.date + '\n' +
      'Reply with the name of the budget you would like to add this transaction to.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1' + user.phoneNumber
    })
    .then(message => {
      console.log(message.sid);
    })
    .done();
    user.lastTextedTransaction = transaction._id;
    user.save();
  });
  });

  

};

module.exports = {
  sendTestSMS,
  receiveSMS,
  sendSMSVerificationCode,
  verifySMSVerificationCode,
  sendTransactionSMSToUser
}
