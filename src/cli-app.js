// ────────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ────────────────────────────────────────────────────────────────────────────────

const ExifImage = require("exif").ExifImage;
const geocoder = require("local-reverse-geocoder");
const fileHandler = require("./fileHandler");
const rename = require("./rename");

fileHandler.readFiles().then(data => console.log(data.length + " files found"));