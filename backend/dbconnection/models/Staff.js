const { Schema, model } = require('mongoose');

 const teacherSchema = new Schema({
 email: String,
  name: String,
  dateStarted:String,
  buildingName:String,
  group:String,
  program:String,
  status:String,
  history:Array,
  id:String
});
module.exports = model('Teacher', teacherSchema);

// module.exports = User;