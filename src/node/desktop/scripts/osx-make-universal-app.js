// README
// First run `yarn make-osx-x64` (new script added, otherwise we would have an error due to a difference on the SHA signature of each app because the package.json is different for each app)
// Then, after it's done, rename `x64` to `arm64` on the following places:
// 1) forge.config.js:84 (path: __dirname + '/out/RStudio-darwin-x64/RStudio.app')
// 2) scripts/script-tools.ts:46 (getForgePlatformOutputDir())
// 3) scripts/create-full-package-file-name.js:79 (getArchName()) > add `return 'arm64'` on the first line of that function.
// Those steps will guarantee that every change that relies on x64 naming will be applied to arm64 too.
// Now after saving the changes, run `yarn make-osx-arm`
// Then run `node osx-make-universal-app.js`

const { makeUniversalApp } = require('@electron/universal');
const path = require('path');
const package = require('../../package.json');
const appdmg = require('appdmg');

const x64AppPath = path.join(__dirname, 'RStudio-darwin-x64', 'RStudio.app');
const arm64AppPath = path.join(__dirname, 'RStudio-darwin-arm64', 'RStudio.app');

// Those are the default values. Not used right now but they are here for future reference.
// Right now, when a different build is created, the older is being deleted
// const x64AppPath = path.join(__dirname, '..', 'out', 'RStudio-darwin-x64', 'RStudio.app');
// const arm64AppPath = path.join(__dirname, '..', 'out', 'RStudio-darwin-arm64', 'RStudio.app');

const appName = `${package.productName}-osx-universal-${package.version}.app`.replace(
  new RegExp('\\+', 'g'),
  '-',
);

const outAppPath = path.join(__dirname, '..', 'out', 'make', appName);

console.log("Building universal mac app!");

const getDmgConfig = () => {
  const dmgSize = {
    height: 450,
    width: 801,
  };
  const iconSize = Math.round((dmgSize.width * 12.3) / 100);

  const dmgIconPosition = { x: Math.round((dmgSize.width * 29.23) / 100), y: Math.round((dmgSize.height * 57.99) / 100) };
  const dmgApplicationsPosition = {
    x: Math.round((dmgSize.width * 68.69) / 100),
    y: Math.round((dmgSize.height * 57.99) / 100),
  };

  const dmgConfig = {
    format: 'ULFO',
    title: 'Rstudio-electron-app',
    background: `${__dirname}/../../resources/background/dmg-background.tiff`,
    icon: `${__dirname}/../../resources/icons/RStudio.icns`,
    iconSize,
    additionalDMGOptions: {
      window: {
        size: dmgSize,
      },
    },
    contents: [
      {
        ...dmgIconPosition,
        type: 'file',
        path: outAppPath,
      },
      {
        ...dmgApplicationsPosition,
        type: 'link',
        path: '/Applications',
      },
    ],
  };

  return dmgConfig
}

const createUniversalAppDmg = async () => {

  await makeUniversalApp({
    x64AppPath,
    arm64AppPath,
    outAppPath,
  });

  // This should take the new universal binary and create a DMG from it.
  // const ee = appdmg({
  //   target: 'test.dmg',
  //   basepath: __dirname,
  //   specification: getDmgConfig()
  // });

  // ee.on('progress', function (info) {
  //   console.log('Build progress:', info);
  //   // info.current is the current step
  //   // info.total is the total number of steps
  //   // info.type is on of 'step-begin', 'step-end'

  //   // 'step-begin'
  //   // info.title is the title of the current step

  //   // 'step-end'
  //   // info.status is one of 'ok', 'skip', 'fail'

  // });

  // ee.on('finish', function () {
  //   console.log('Finished building dmg')
  //   // There now is a `test.dmg` file
  // });

  // ee.on('error', function (err) {
  //   console.error("Error building dmg:", err);
  //   // An error occurred
  // });

}

createUniversalAppDmg();