var mongoose = require('mongoose');

var TodoSchema = new mongoose.Schema({
  completed: Boolean,
  istrinti: String,
  pakeista: Boolean,
  text: String,
  updated_at: { type: Date, default: null},
  created_at: { type: Date, default: Date.now }
});

TodoSchema.set('toJSON', {
     transform: function (doc, ret, options) {
         ret.id = ret._id;
         delete ret._id;
         delete ret.__v;
     }
}); 

module.exports = mongoose.model('Todo', TodoSchema);