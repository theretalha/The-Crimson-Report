import {register} from '../registry';
import {Tanker, tankerEvents} from './Tanker';

// Reference prop used to test the custom-prop system. Real episodes get their own folder: src/props/custom/epNNN/.
register({
  id: 'example.tanker',
  describes: 'an oil tanker riding on the water, funnel smoking, deck hatches',
  evidence: 'tankers?|oil ship|supertankers?',
  hero: true,
  Comp: Tanker,
  events: tankerEvents,
});
