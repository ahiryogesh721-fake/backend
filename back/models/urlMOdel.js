const { Schema, model } = require("mongoose");

const entrySchema = new Schema(
  {
    I: Schema.Types.Mixed,
    X: Schema.Types.Mixed,
    players: Schema.Types.Mixed,
    playersBets: Schema.Types.Mixed,
    playersGets: Schema.Types.Mixed,
    inout: Schema.Types.Mixed,
    buger: Schema.Types.Mixed,
    time: Schema.Types.Mixed,
  },
  { _id: true }
);

const urlSchema = new Schema({
  I: Schema.Types.Mixed,
  url: Schema.Types.Mixed,
  time: Schema.Types.Mixed,
  entries: { type: [entrySchema], default: [] },
});

const urlModel = model("urls", urlSchema);

module.exports = { urlModel };
