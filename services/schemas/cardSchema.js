const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cardSchema = new Schema({
  title: {
    type: String,
    required: [true, "Card Name is required"],
  },
  description: String,
  labelColor: String,
  deadline: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "columns",
  },
});
const Card = mongoose.model("cards", cardSchema);
module.exports = Card;
