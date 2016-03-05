import dreijaConfig from 'dreija-config';
import env from 'dreija-env';
import Dreija from './src/app/Dreija';
import { Root } from './src/shared/components';


const dreija =  new Dreija({
    port: 3030,
    dbhost: 'http://localhost:5984',
    root: Root
});

if (dreijaConfig) {
    dreijaConfig(dreija, env);
}

export default dreija;

export { actions } from './src/shared/actions';

export { connectToStore } from './src/shared/lib/decorators/redux';
