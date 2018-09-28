# FreshBudgets

Instructions / notes for running and testing the backend server

Links

* https://nodejs.org/en/docs/guides/
* https://mongodb.github.io/node-mongodb-native/3.1/quick-start/quick-start/
* https://cloud.mongodb.com/v2/5b8727749701993a37d8c670#clusters/detail/Cluster0 (Our MongoDB cloud cluster)


## Prerequisites

Before running the server

```
npm install
```

## Installing

Installing npm packages

```
npm install <package name> 
```

To save the node package to package.json

```
npm install --save <package name>
```


## Running the server locally

To run the server locally, within backend/

```
node app.js
```

Now you can test GETs, POSTs, etc. with Postman

## Testing with Postman

First run the server locally. Within Postman set the requrest url to 

```
localhost:5000/api/...
```

replace ... with whatever route you wish to access. If sending a POST, the contents sent are in the Body section. Tokens go in the header
