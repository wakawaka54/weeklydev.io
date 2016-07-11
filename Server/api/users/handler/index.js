module.exports = {
  login: require('./login'),
  logout: require('./logout'),
  addUser: require('./user/addUser'),
  getUsers: require('./user/getUsers'),
  getUser: require('./user/id/getUser'),
  getTeamsIn: require('./user/getTeamsIn'),
  updateUser: require('./user/id/updateUser'),
  deleteUser: require('./user/id/deleteUser'),
  getCurrentUser: require('./user/getCurrentUser')
};
