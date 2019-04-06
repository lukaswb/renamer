// ────────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ────────────────────────────────────────────────────────────────────────────────

const fsPromises = require("fs").promises;
const fs = require("fs");
var path = require("path");
const ExifImage = require("exif").ExifImage;
const geocoder = require("local-reverse-geocoder");
const mkdirp = require("mkdirp");
const params = require("./parameter");
const debug = require('debug')('dev');



// ────────────────────────────────────────────────────────────────────────────────
// Global Variables
// ────────────────────────────────────────────────────────────────────────────────

// Source Folder
var sourceFolderPath;
var targetFolderPath;
// Destination Folder


// SubFolder
var subFolder;
// Data Array for File Storage (Source & Destination)
var imageSrc = [];
var imageDest = [];

// ────────────────────────────────────────────────────────────────────────────────
// Initialize Geocoder
// ────────────────────────────────────────────────────────────────────────────────

geocoder.init({
    load: {
      admin1: true,
      admin2: true,
      admin3And4: false,
      alternateNames: false
    }
  },
  function () {
    // Ready to call lookUp
  }
);

// ────────────────────────────────────────────────────────────────────────────────
// Console Params
// ────────────────────────────────────────────────────────────────────────────────

var input = params.checkInput();
sourceFolderPath = input.sourceFolderPath;
targetFolderPath = input.targetFolderPath;


// ────────────────────────────────────────────────────────────────────────────────
// Handle GPS
// ────────────────────────────────────────────────────────────────────────────────

// Lookup Location for latDD and lngDD
function getLocation(lat, lng) {
  if (!lat || !lng) {
    // Return if lat or lng is not defined
    return;
  } else {
    var location;
    var point = {
      latitude: lat,
      longitude: lng
    };

    //Return Location
    geocoder.lookUp(point, function (err, res) {
      res[0].forEach(function (el, i) {
        location = el.name;
      });
    });
    return location;
  }
}

// Convert Degree Minutes Seconds to Decimal Degree
function convertDMStoDD(dms) {
  if (!dms) {
    return;
  } else {
    var degree = dms[0];
    var minutes = dms[1];
    var seconds = dms[2];
    return degree + minutes / 60 + seconds / 3600;
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// File System interaction
// ────────────────────────────────────────────────────────────────────────────────

// Read Directory and Store files in data Array
function readFiles() {
  fs.readdirSync(sourceFolderPath).forEach(file => {
    // Store files in data array
    imageSrc.push(path.resolve(sourceFolderPath + "/" + file));
  });
  // Output number of files in folder
  console.log("Found " + imageSrc.length + " files in " + sourceFolderPath);
}

// Create subfolder for each creation date
function createTargetFolder(targetFolderPath) {
  // Create Directory for renamed files
  mkdirp(targetFolderPath, function (err) {
    if (err) {
      console.log(err);
    }
  });

  // var subFolder = targetFolder + '/' + created;
  // if (!fs.existsSync(subFolder)) {
  //   mkdirp(subFolder, function (err) {
  //     console.log(err);
  //   });
  // }
}

// Create subdirectories
function createSubFolder(targetFolderPath, created) {
  return new Promise(function (resolve, reject) {
    subFolder = targetFolderPath + "/" + created;
    mkdirp(subFolder, function (err, data) {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

// Create subdirectories

function createSubFolderAsync(targetFolderPath, created) {
  subFolder = targetFolderPath + "/" + created;
  fsPromises.mkdir(subFolder, {
    recursive: true,
    mode: 0o775
  });
}



function renameFile(file, filename) {
  //Rename files
  //TODO: Copy file instead of rename to preserve original file
  fs.rename(file, filename, function (err) {
    if (err) throw err;
    console.log("Rename " + file + " -> " + filename);
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// EXIF Information to retrieve new filename
// ────────────────────────────────────────────────────────────────────────────────

function readExif(file, index) {
  //Read Exif data for each file
  return new Promise(function (resolve) {
    new ExifImage({
        image: file
      },
      function (error, exifData) {
        if (error) {
          // TODO: Implement better error handling 
          debug(error);
        } else {
          // Retrieve Creation Date
          var created = exifData.exif.CreateDate;
          if (created) {
            // Convert Date into format YYYY-MM-DD
            created = created.substring(0, 10).replace(/:/g, "-");
          }

          // Retrieve Latitude and Longtitude (in DMS format)
          var lat = exifData.gps.GPSLatitude;
          var lng = exifData.gps.GPSLongitude;

          // Convert lat and lng into Decimal Degree Formatio
          var latDD = convertDMStoDD(lat);
          var lngDD = convertDMStoDD(lng);

          // Retrieve City from latDD and lngDD
          var city = getLocation(latDD, lngDD);

          if (!city) {
            // If city is not retrieved use original filename
            city = "";
          }

          // Retrieve image index from filename
          var fileIndex = file
            .substring(file.length - 10, file.length - 4)
            .split(" ");

          // If created date is not retrieved use placeholder
          if (!created) {
            created = "YYYY-MM-DD";
          }

          // If image index is not defines use array index instead
          if (!fileIndex[1]) {
            fileIndex[1] = index;
          }

          // Set filename
          var filename =
            created +
            "/" +
            created +
            " " +
            city +
            " " +
            fileIndex[1] +
            ".jpg";
          imageDest.push(filename);

          //createSubFolder(targetFolderPath, created);

          subFolder = targetFolderPath + "/" + created;
          fsPromises.mkdir(subFolder, {
            recursive: true,
            mode: 0o775
          }).then(console.log("Subfolder " + subFolder + "has been created."));

          //.then(renameFile(file, filename));

          resolve();









        }

      }
    );

  });
}



// ────────────────────────────────────────────────────────────────────────────────
// RUN renaming for input folder
// ────────────────────────────────────────────────────────────────────────────────

// Create  target folder
readFiles();
createTargetFolder(targetFolderPath);

imageSrc.forEach(function (img, index) {
  console.log("File: " + img);
  readExif(img, index).then(debug("file: " + imageDest[index]));

  //renameFile(img, imageDest[index])
});