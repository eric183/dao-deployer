const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const imageDirPath = resolve(__dirname, '../dist/assets');

// Get an array of the files inside the folder
const files = readdirSync(imageDirPath);

// Loop through each file that was retrieved
// file = file.replace(/(.+\..+\.).+\./gim, '$1');
files.forEach((file) => {
  rename(
    imageDirPath + `/${file}`,
    imageDirPath + `/${file.replace(/(.+\..+\.).+\./gim, '$1')}`,
    (err) => {
      if (err) throw err;
    },
  );
});
