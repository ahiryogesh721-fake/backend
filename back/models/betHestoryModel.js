const { Schema, model } = require("mongoose");

const betHestorySchema = new Schema({
  inti: Schema.Types.Mixed,
  res: Schema.Types.Mixed,
  con: Schema.Types.Mixed,
});

const betHestoryModel = model("betHestory", betHestorySchema);

module.exports = { betHestoryModel };
