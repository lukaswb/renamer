const fs = require("fs");
var path = require("path");
const ExifImage = require("exif").ExifImage;
const geocoder = require("local-reverse-geocoder");
const mkdirp = require("mkdirp");

// Initialize Geocoder
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

// Check if Console params has been provided, if not exit process
if (process.argv.length <= 2) {
  console.log("Usage: " + __filename + " Directory Path");
  process.exit(-1);
}

// Retrieve parameter for folder path from console
var folderPath = process.argv[2];
console.log("Path: " + folderPath);

// Optional targetFolder name
if (process.argv[3]) {
  var targetFolder = process.argv[3];
} else {
  var folderSrc = folderPath.split("/");
  var targetFolder = folderSrc[folderSrc.length - 1] + "-modified";

}


// Data Array for File Storage (Source & Destination)
var imageSrc = [];
var imageDest = [];

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

// Read Directory and Store files in data Array
fs.readdirSync(folderPath).forEach(file => {
  // Store files in data array
  imageSrc.push(path.resolve(folderPath + "/" + file));
});

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

// Retrieve Exif Information for each file
function readExif(file, index) {
  //Read Exif data for each file
  try {
    new ExifImage({
        image: file
      },
      function (error, exifData) {
        if (error) {
          console.log("Error: " + error.message);
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

          var fileIndex = file.substring(file.length - 10, file.length - 4).split(" ");



          // If created date is not retrieved use placeholder
          if (!created) {
            created = "YYYY-MM-DD";
          }

          // Create Directory for renamed files
          mkdirp(targetFolder, function (err) {

            console.log(err)
          });


          // Create subfolder for each creation date
          var subFolder = targetFolder + '/' + created;
          if (!fs.existsSync(subFolder)) {
            mkdirp(subFolder, function (err) {
              console.log(err);
            });
          }

          // Set filename
          var filename = subFolder + '/' + created + " " + city + " " + fileIndex[1] + ".jpg";
          imageDest.push(filename);

          //Rename files
          fs.rename(file, filename, function (err) {
            if (err) throw err;
            console.log('renamed complete');
          });

        }
      }
    );
  } catch (error) {
    console.log("Error: " + error.message);
  }
}

// Output number of files in folder
console.log("Found " + imageSrc.length + " files in " + folderPath);

imageSrc.forEach(function (img, index) {
  console.log(img);
  readExif(img, index);
});