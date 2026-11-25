import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setConcurrency(4);
// Use the pre-installed browser if present (cloud session). On your PC, delete this line.
if (process.env.CRIMSON_BROWSER) Config.setBrowserExecutable(process.env.CRIMSON_BROWSER);
