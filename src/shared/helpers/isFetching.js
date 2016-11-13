import Immutable from 'immutable';
import {
    RESOURCE_LOADING_SET_KEY
} from '../constants';



/**
 * Check if resource is currently being fetched from the server.
 * @param  {Store} state
 * @param  {...String[]} path - if none is given, returns whether any resource
 *                              is in flight.
 * @return {Boolean}
 */
export default (state, ...path) => {
    const { resource } = state;

    // No resource info means not fetching
    if (!resource) {
        return false;
    }

    const loadingSet = resource.get(RESOURCE_LOADING_SET_KEY, Immutable.Set());

    // No path: treat as query "is any loading"
    if (!path || !path.length) {
        return !!loadingSet.size;
    }

    // TODO something less brittle? Maybe check actual resource path?
    return loadingSet.get(path.join(':'));
};
