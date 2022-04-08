const { rmSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const imageDirPath = resolve(__dirname, '../dist/assets');
const distDirPath = resolve(__dirname, '../dist');

const DIST_FILES = ['dev.html', 'index.html', 'sdkserver.html', 'tsdoc.html'];

// Clean Assets
rmSync(imageDirPath, { recursive: true, force: true });

// Clean Dist Files
DIST_FILES.forEach((file) => {
  // const filePath = resolve(imageDirPath, file);
  const distFilePath = resolve(distDirPath, file);
  rmSync(distFilePath, { recursive: true });
  // rename(filePath, distFilePath, err => {
  //   if (err) {
  //     console.log('ERROR: ', err);
  //   }
  // });
});
