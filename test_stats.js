const mongoose = require('./backend/node_modules/mongoose');
const { resolveInstitutionSelection } = require('./backend/src/utils/institutionScope.js');
const { nigerianInstitutions } = require('./backend/src/data/nigerianInstitutions.js');

mongoose.connect('mongodb://127.0.0.1:27017/gounion').then(async () => {
    try {
        const db = mongoose.connection.db;
        const users = await db.collection('users').find({}).toArray();
        console.log('total users in db:', users.length);
        
        const legacyNames = Array.from(new Set(users
            .filter((user) => !user.institution_id && user.profile?.university)
            .map((user) => user.profile.university)));
            
        console.log('legacy names:', legacyNames);
        
        const resolvedLegacyNames = new Map();
        
        // Let's mock resolveInstitutionSelection logic if we can't import ES modules in CJS script easily
    } catch(e) {
        console.error(e);
    }
    process.exit();
});
