// ────────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ────────────────────────────────────────────────────────────────────────────────
const ExifImage = require("exif").ExifImage;
const fs = require("fs");
const geocoder = require("local-reverse-geocoder");
const fileHandler = require("./fileHandler");
const debug = require('debug')('dev');
var exports = module.exports = {};


// ────────────────────────────────────────────────────────────────────────────────
// READ FOLDER AND STORE RENAMING
// ────────────────────────────────────────────────────────────────────────────────
fileHandler.readFiles().then(images => {
  images.forEach((file, index) => {
    readExif(file, index).then(data => {
      renameFile(file, data[0]);
    });
  });
});

//fsPromises.mkdir(data[0].substring(fileHandler.getTarget().length + 1, fileHandler.getTarget().length + 11)).then(sub =>



function renameFile(file, filename) {


  fileHandler.createTargetFolders(filename.substring(fileHandler.getTarget().length + 1, fileHandler.getTarget().length + 11));

  console.log("Created folder " + filename.substring(fileHandler.getTarget().length + 1, fileHandler.getTarget().length + 11));

  //Rename files
  //TODO: Copy file instead of rename to preserve original file
  fs.rename(file, filename, function (err) {
    if (err) throw err;
    console.log("Rename " + file + " -> " + filename);
  });
}

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
// READ EXIF DATA
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
            fileHandler.getTarget() + "/" +
            created +
            "/" +
            created +
            " " +
            city +
            " " +
            fileIndex[1] +
            ".jpg";
          let imageDest = [];

          imageDest.push(filename);

          resolve(imageDest);

        }
      }
    );
  });
}