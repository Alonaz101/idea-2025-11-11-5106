const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserPreferenceSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  preferredCuisines: [{ type: String }],
  dietaryRestrictions: [{ type: String }],
  dislikedIngredients: [{ type: String }],
  favoriteMoods: [{ type: Schema.Types.ObjectId, ref: 'Mood' }]
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);
