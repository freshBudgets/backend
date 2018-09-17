const user = (req, res) => {
  res.json({
    success: true,
    user: {
      firstName: 'Cole',
      lastName: 'Johnson',
    }
  })
};

module.exports = { user };
