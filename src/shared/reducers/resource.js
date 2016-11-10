import Immutable from 'immutable';
import {
    RESOURCE_STORE_KEY,
    REQUEST_RESOURCE,
    REQUEST_RESOURCE_LIST,
    RECEIVE_RESOURCE,
    RECEIVE_RESOURCE_LIST,
    RESOURCE_LOADED_KEY,
    RESOURCE_LOADING_KEY
} from '../constants';




function createResourceContainer(id, data = {}) {
    return Immutable.fromJS({
        id,
        [RESOURCE_LOADED_KEY]: false,
        [RESOURCE_LOADING_KEY]: false,
        [RESOURCE_STORE_KEY]: data
    });
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Action handlers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const ACTIONS = {

/**
 * Mark a resource list as pending.
 */
[REQUEST_RESOURCE_LIST]: (state, action) => {
    const { view } = action;
    let currentView = state.get(view, createResourceContainer(view));
    return state.set(view, currentView.set(RESOURCE_LOADING_KEY, true));
},

/**
 * Mark a resource as pending.
 */
[REQUEST_RESOURCE]: (state, action) => {
    const { view, key } = action;
    let currentView = state.get(view, createResourceContainer(view));

    // Create placeholder resource by key.
    // TODO merge data instead of destructive reload?
    currentView = currentView.setIn(
        [RESOURCE_STORE_KEY, key],
        createResourceContainer(key)
    );

    // Mark resource as pending.
    currentView = currentView.setIn(
        [RESOURCE_STORE_KEY, key, RESOURCE_LOADING_KEY],
        true
    );

    return state.set(view, currentView);
},

/**
 * Add content for a received resource list to state.
 */
[RECEIVE_RESOURCE_LIST]: (state, action) => {
    const { view, data } = action;
    let currentView = state.get(view, createResourceContainer(view));

    // TODO batch update
    // TODO keep an index of these resources
    data.forEach(resource => {
        const key = resource.id;
        currentView = currentView.mergeDeepIn(
            [RESOURCE_STORE_KEY, key],
            createResourceContainer(key, resource)
        );
    });

    return state.set(view, currentView);
},

/**
 * Add content for received resource to state.
 */
[RECEIVE_RESOURCE]: (state, action) => {
    const { view, key, data } = action;
    let currentView = state.get(view, createResourceContainer(view));

    currentView = currentView.mergeDeepIn(
        [RESOURCE_STORE_KEY, key],
        createResourceContainer(key, data)
    );

    return state.set(view, currentView);
}

};


/**
 * State subtree reducer for `resources`.
 */
export default function update(state = Immutable.Map(), action) {
    const { type } = action;
    return ACTIONS.hasOwnProperty(type) ?
        ACTIONS[type](state, action) :
        state;
}
