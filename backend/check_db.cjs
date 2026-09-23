const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/gounion').then(async () => {
  const db = mongoose.connection.db;
  const posts = await db.collection('posts').find({ video_url: { $exists: true, $ne: null } }).limit(2).toArray();
  console.log("VIDEO POSTS:");
  console.log(JSON.stringify(posts, null, 2));

  const rawPosts = await db.collection('posts').find().sort({created_at: -1}).limit(5).toArray();
  console.log("RECENT POSTS:");
  console.log(JSON.stringify(rawPosts, null, 2));
  process.exit(0);
});
