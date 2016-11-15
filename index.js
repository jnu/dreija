import dreijaConfig from 'dreija-config';
import env from 'dreija-env';
import Dreija from './src/app/Dreija';
import { Root } from './src/shared/components';


const dreija =  new Dreija({
    port: 3030,
    dbhost: 'localhost',
    root: Root,
    loginRoute: {
        failure: '/login',
        success: '/admin'
    },
    title: 'Untitled App'
});

if (dreijaConfig) {
    dreijaConfig(dreija, env);
}

export default dreija;

export {
    actions
} from './src/shared/actions';

export {
    RESOURCE_STORE_KEY
} from './src/shared/constants';

export {
    connectToStore, // DEPRECATED
    withData
} from './src/shared/lib/decorators/redux';

export {
    withAuth
} from './src/shared/lib/auth';


