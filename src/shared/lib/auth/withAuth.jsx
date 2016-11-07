import { auth } from './';
import { difference } from 'lodash';
import { BROWSER } from '../../env';


/**
 * Get user roles either from store or from auth model.
 * @param  {Store} store
 * @return {Promise<string[]>}
 */
function getUserRoles(store) {
    // Force pinging client-side.
    // TODO ought to strip this code in production client build.
    if (!BROWSER) {
        // TODO could optimize out try-catch.
        try {
            const roles = store.getState().user.roles;
            return Promise.resolve(roles);
        } catch (e) {
            return auth.getUserRoles();
        }
    } else {
        return auth.getUserRoles();
    }
}


/**
 * Create a function t verify that user has all of the given roles before proceeding.
 * @param  {...string} roles
 * @return {(...string[]) => EnterHook} react-router enter hook factory
 */
export function getWithAuthUtil(store) {
    return (...roles) => {
        return (nextState, replace, callback) => {
            getUserRoles(store)
                .then(userRoles => {
                    if (!userRoles || difference(roles, userRoles).length !== 0) {
                        throw new Error('Unauthorized');
                    }
                })
                .catch(error => {
                    replace('/login');
                })
                .then(callback);
        };
    };
}
