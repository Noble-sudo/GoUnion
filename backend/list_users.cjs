const mongoose = require('mongoose');

async function listUsers() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
    const users = await mongoose.connection.db.collection('users').find({}, { projection: { username: 1, email: 1, full_name: 1 } }).toArray();
    console.log(users);
    process.exit(0);
}
listUsers();
