import createMemoryHistory from 'react-router/lib/createMemoryHistory';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import { BROWSER } from './env';

export const history = BROWSER ? createBrowserHistory() : createMemoryHistory();
