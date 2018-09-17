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
    }
  })
}

const getOne = (req, res) => {
  res.json({
    success: true,
    1: {
        id: 1,
        name: 'Food',
        total: 25.00,
        spent: 19.56
      }
  })
}

module.exports = { getAll, getOne };
