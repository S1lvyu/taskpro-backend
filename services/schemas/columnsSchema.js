const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const columnsSchema = new Schema({
  name: { type: String, required: [true, "Name is required"] },
  cards: [
    {
      type: Schema.Types.ObjectId,
      ref: "cards",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "boards",
  },
});
const Column = mongoose.model("columns", columnsSchema);
module.exports = Column;
