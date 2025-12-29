const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Không có quyền truy cập' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ success: false, message: 'Không có quyền thực hiện hành động này' });
        }

        const hasRole = req.user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ success: false, message: 'Bạn không có vai trò cần thiết' });
        }
        next();
    };
};

module.exports = { protect, authorize };
