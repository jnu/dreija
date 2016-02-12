import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import { browserHistory } from 'react-router';
import { BROWSER } from './env';

export const history = BROWSER ? browserHistory : createMemoryHistory();
