import('./backend/src/models.js').then(async (m) => {
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://127.0.0.1:27017/gounion');
  
  // Set category to 'Sports' for GOUNI SPORT specifically
  await m.Group.updateMany(
    { name: /SPORT/i, category: { $exists: false } },
    { $set: { category: 'Sports' } }
  );

  // Set category to 'Other' for any others
  await m.Group.updateMany(
    { category: { $exists: false } },
    { $set: { category: 'Other' } }
  );

  const groups = await m.Group.find({}, 'name category');
  console.log(groups);
  process.exit(0);
});
