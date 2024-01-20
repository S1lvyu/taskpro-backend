const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const backgroundImagesSchema = new Schema({
  name: String,
  imgURL: String,
});

const BackgroundImages = mongoose.model(
  "backgroundImages",
  backgroundImagesSchema
);
module.exports = BackgroundImages;
