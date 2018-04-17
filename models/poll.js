const mongoose = require('mongoose');
Schema = mongoose.Schema;
var User = require('./user')
const PollSchema = new Schema ({
  creator: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  results:[{
      choice: String,
      count: Number
    }],
  pollTitle: {
    type: String
  },
  pollOptions: {
    type: [String]
  }
});
module.exports = mongoose.model('Poll', PollSchema);