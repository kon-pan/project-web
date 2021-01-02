// User defined module imports
const Admin = require('../models/admin');

exports.getLogin = (req, res, next) => {
  res.render('admin/public/login');
};

exports.getUsers = (req, res, next) => {
  
}

exports.getIndex = async (req, res, next) => {
  const totalUsers = await Admin.getTotalUsers();
  const totalEntries = await Admin.getTotalEntries();
  const uniqueDomains = await Admin.getTotalDomains();
  const uniqueIsps = await Admin.getTotalIsps();
  res.render('admin/auth/index-v2', {
    path: '/admin/home',
    user: req.user,
    totalUsers: totalUsers,
    totalEntries: totalEntries,
    uniqueDomains: uniqueDomains,
    uniqueIsps: uniqueIsps,
  });
};
