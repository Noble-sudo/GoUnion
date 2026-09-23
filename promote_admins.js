const mongoose = require('./backend/node_modules/mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/gounion').then(async () => {
    const db = mongoose.connection.db;
    await db.collection('users').updateMany(
        { email: /ezeilodavid/ },
        { $set: { role: 'admin' } }
    );
    console.log('Promoted all ezeilodavid accounts to true backend Admins');
    process.exit(0);
});
