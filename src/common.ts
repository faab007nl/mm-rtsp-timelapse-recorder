import {createFolder} from "./fileUtils";
import {Config} from "./config";
import {createDbTables} from "./sql";

const init = () => {
    createFolder(Config.dataDir);
    createFolder(Config.screenshotsDir);
    createFolder(Config.videoDir);
    createDbTables();
}

const getRandomPort = () => {
    const min = 3000;
    const max = 3999;
    const floatRandom = Math.random()
    const difference = max - min
    const random = Math.round(difference * floatRandom)
    return random + min
}

export { init, getRandomPort };