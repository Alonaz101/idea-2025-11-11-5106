const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserMoodEntrySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  moodId: { type: Schema.Types.ObjectId, ref: 'Mood', required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserMoodEntry', UserMoodEntrySchema);
