const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    const newHash = await bcrypt.hash('password123', 10);
    
    for (const user of users) {
        await db.collection('users').updateOne(
            { _id: user._id },
            { $set: { password_hash: newHash } }
        );
        console.log(`Reset password for ${user.username} (${user.email}) to: password123`);
    }
    console.log("All passwords reset to password123");
    process.exit(0);
}
resetPasswords();
