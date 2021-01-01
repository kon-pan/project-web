exports.getLogin = (req, res, next) => {
  res.render('admin/public/login');
};

exports.getIndex = (req, res, next) => {
  res.render('admin/auth/index');
};
