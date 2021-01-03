// User defined module imports
const Admin = require('../models/admin');

exports.getLogin = (req, res, next) => {
  res.render('admin/public/login');
};

exports.getUsers = async (req, res, next) => {
  const users = await Admin.getUsers();

  res.render('admin/auth/users', {
    path: '/admin/users',
    user: req.user,
    users: users,
  });
}

exports.getRequestsGroupByMethod = async (req, res, next) => {
  const data = await Admin.getRequestsGroupByMethod();
  
  res.json(data);
}

exports.getResponsesGroupByStatus = async (req, res, next) => {
  const data = await Admin.getResponsesGroupByStatus();
  
  res.json(data);
}

exports.getIndex = async (req, res, next) => {
  const totalUsers = await Admin.getTotalUsers();
  const totalEntries = await Admin.getTotalEntries();
  const uniqueDomains = await Admin.getTotalDomains();
  const uniqueIsps = await Admin.getTotalIsps();

  res.render('admin/auth/index', {
    path: '/admin/home',
    user: req.user,
    totalUsers: totalUsers,
    totalEntries: totalEntries,
    uniqueDomains: uniqueDomains,
    uniqueIsps: uniqueIsps,
  });
};
