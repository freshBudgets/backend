const getAll = (req, res) => {
  res.json({
    success: true,
    total: {
      spent: 54.78,
      total: 75.00
    },
    budgets: {
      1: {
        id: 1,
        name: 'Food',
        total: 25.00,
        spent: 19.56
      },
      2: {
        id: 2,
        name: 'Gas',
        total: 50.00,
        spent: 35.22
      },
      3: {
        id: 3,
        name: 'Alcohol',
        total: 300.00,
        spent: 354.00
      },
      4: {
        id: 4,
        name: 'Car Parts',
        total: 100.00,
        spent: 34.12
      }
    }
  })
}

const getOne = (req, res) => {
  let data = {
    success: true,
  }

  data[req.params.id] = {
      id: req.params.id,
      name: 'Food',
      total: 25.00,
      spent: 19.56,
      transactions: [
        {
          from: 'Payless',
          amount: 4.56
        },
        {
          from: 'Walmart',
          amount: 5.54,
        },
        {
          from: 'Target',
          amount: 9.21
        }, {
          from: 'BP',
          amount: .25
        }
      ]
    }
  res.json(data)
}

module.exports = { getAll, getOne };
