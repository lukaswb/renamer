var exports = module.exports = {};

var targetFolderPath;

exports.checkInput = function () {
 // Check if Console params has been provided, if not exit process
 if (process.argv.length <= 2) {
  console.log("Usage: " + __filename + " Directory Path");
  process.exit(-1);
 }

 // Retrieve parameter for folder path from console
 var sourceFolderPath = process.argv[2];
 console.log("Path: " + sourceFolderPath);

 // Optional targetFolder name
 if (process.argv[3]) {
  targetFolderPath = process.argv[3];
 } else {
  targetFolderPath = sourceFolderPath + "-modified";

 }
 return {
  sourceFolderPath,
  targetFolderPath
 };
};