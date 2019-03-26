# Renamer

In order to organize my imported pictures from my iPhone7 I wanted to automate the renaming and structure into subfolders.

The desired format looks as the follwing:

YYY-MM-DD Location Index.jpg

YYYY-MM-DD is the EXIF creation date (if not existing the old name will be used)
Location is the city based on the EXIF gps latitude and longitude
Index is the index derived from the original file (usually a 3-4 digit number)

## Getting Started

Download the git repo and run npm install.

### Run the Application

The application takes two parameters, the source folderpath and the target folderpath.
If the source folder is not defined the program will not run. If the target folder is not defined the standard is the original path + "-modified".

Example: node index.js iPhone_Upload iPhone_Upload-modified

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc
