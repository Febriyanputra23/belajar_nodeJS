const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'token tidak ditemukan' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            return res.status(403).json({ error: 'Token tidak valid, atau kadaluwarsa' });
        }
        req.user = decodedPayload.user; //Sekarang req.user berisi {id, username, role}

        next();
    });
}

//Midleware untuk Autorisasi (Baru)
function authorizeRole(role) {
    return (req, res, next) => {
        //Midleware harus dijalankan setelah authenticateToken
        if (req.user && req.user.role === role) {
            next(); //Peran cocok dilanjutkan 
        } else {
            //Pengguna terauntentikasi, tetapi tidak memiliki ijin
            return res.status(403).json({ error: 'Akses Dilarang: Peran tidak memadai' });
        }
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};