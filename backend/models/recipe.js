const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  ingredients: [{ type: String, required: true }],
  instructions: { type: String, required: true },
  moodTags: [{ type: Schema.Types.ObjectId, ref: 'Mood' }],
  nutritionInfo: {
    calories: Number,
    fat: Number,
    protein: Number,
    carbs: Number
  },
  dietaryRestrictions: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Recipe', RecipeSchema);
