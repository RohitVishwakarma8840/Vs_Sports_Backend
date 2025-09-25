const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token'); 
  if (!token) return res.status(401).json({status:401, msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({status:401, msg: 'Token is not valid' });
  }
};


const managerOnly = (req, res, next) => {
  if (req.user.userType !== 'manager') {
    return res.status(403).json({status:403, msg: 'Access denied: Managers only' });
  }
  next();
};

module.exports = { auth ,managerOnly};