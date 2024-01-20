const mongoose = require("mongoose");
const Column = require("./columnsSchema");
const Schema = mongoose.Schema;
const boardSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  icon: String,
  background: {
    type: String,
    default: null,
  },
  columns: [
    {
      type: Schema.Types.ObjectId,
      ref: "columns",
    },
  ],
});
const Board = mongoose.model("boards", boardSchema);
module.exports = Board;
