const jwt = require('./backend/node_modules/jsonwebtoken');
const http = require('http');

// Make a fake user object payload for ezeilodavid292@gmail.com
const token = jwt.sign({ id: 'goat', email: 'ezeilodavid292@gmail.com', role: 'admin' }, 'dev-access-secret-change-me', { expiresIn: '1h' });

const req = http.get('http://localhost:8001/api/admin/stats', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
}, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(res.statusCode);
        console.log(data.substring(0, 500));
    });
});

req.on('error', (e) => {
    console.error(e);
});
req.end();
