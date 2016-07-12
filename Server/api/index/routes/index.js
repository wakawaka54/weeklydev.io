var test = require(PATH + '/Matching/match/match.js');

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    auth: 'jwt'
  },
  handler: (req, res) => {
    test(req.Token.id);
    res('Look at the console :)').code(200);
  }
};
