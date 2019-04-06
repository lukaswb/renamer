// ────────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ────────────────────────────────────────────────────────────────────────────────


const fsPromises = require("fs").promises;
const debug = require('debug')('dev');
const cliOptions = require("./cli-options");
const path = require("path");

var exports = module.exports = {};


// Retrieve CLI Options
var command = cliOptions.getInput();
var sourceFolderPath = command.sourceFolderPath;
var targetFolderPath = command.targetFolderPath;


// Array for filenames
var imageSrc = [];


// Check paths
debug("Input paths: " + sourceFolderPath, targetFolderPath);



// ────────────────────────────────────────────────────────────────────────────────
// FILE CHECK
// ────────────────────────────────────────────────────────────────────────────────

// Returns a boolean if the file is either jpg or jpeg
function isImage(file) {
 if (((file.indexOf(".jpg")) + (file.indexOf(".jpeg")) + (file.indexOf(".JPEG")) + (file.indexOf(".JPG"))) > -1) {
  return true;
 } else {
  return false;
 }
}


// ────────────────────────────────────────────────────────────────────────────────
// READ FILES
// ────────────────────────────────────────────────────────────────────────────────
exports.readFiles = function () {

 return new Promise(function (resolve, reject) {

  fsPromises.readdir(sourceFolderPath).then(files => {
   // Store files in data array
   files.forEach(file => {
    if (isImage(file)) {
     imageSrc.push(path.resolve(sourceFolderPath + "/" + file));
    }
   });
   resolve(imageSrc);
  });
 });
};

exports.getTarget = function () {
 return targetFolderPath;
};

// ────────────────────────────────────────────────────────────────────────────────
// CREATE TARGET FOLDERS
// ────────────────────────────────────────────────────────────────────────────────
exports.createTargetFolders = function (created) {

 return new Promise(function (resolve, reject) {
  let subFolder = targetFolderPath + "/" + created;
  fsPromises.mkdir(subFolder, {
   recursive: true,
   mode: 0o775
  });
 });
};