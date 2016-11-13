import Immutable from 'immutable';
import {
    RESOURCE_STORE_KEY,
    REQUEST_RESOURCE,
    REQUEST_RESOURCE_LIST,
    RECEIVE_RESOURCE,
    RECEIVE_RESOURCE_LIST,
    RESOURCE_LOADED_KEY,
    RESOURCE_LOADING_KEY,
    RESOURCE_LOADING_SET_KEY
} from '../constants';



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Action helpers
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function createResourceContainer(id, data = {}) {
    return Immutable.fromJS({
        id,
        [RESOURCE_LOADED_KEY]: false,
        [RESOURCE_LOADING_KEY]: false,
        [RESOURCE_STORE_KEY]: data
    });
}

function withResourceLoading(state, ...keys) {
    const loadingSet = state.get(RESOURCE_LOADING_SET_KEY);
    const key = keys.join(':');
    return state.set(RESOURCE_LOADING_SET_KEY, loadingSet.add(key));
}

function withResourceLoaded(state, ...keys) {
    const loadingSet = state.get(RESOURCE_LOADING_SET_KEY);
    const key = keys.join(':');
    return state.set(RESOURCE_LOADING_SET_KEY, loadingSet.remove(key));
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
    const currentView = state.get(view, createResourceContainer(view));
    return withResourceLoading(state, view)
        .set(view, currentView.set(RESOURCE_LOADING_KEY, true));
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

    return withResourceLoading(state, view, key).set(view, currentView);
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

    return withResourceLoaded(state, view).set(view, currentView);
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

    return withResourceLoaded(state, view, key).set(view, currentView);
}

};



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Action setup
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

/**
 * Default resource store state
 * @Constant {Immutable.Map}
 */
const DEFAULT_RESOURCE_STATE = Immutable.Map({
    [RESOURCE_LOADING_SET_KEY]: Immutable.Set()
});

/**
 * Ensure that the RESOURCE_LOADING_SET is actually a Set, not a List. This is
 * necessary because serialized Immutable Sets and Lists look the same, so when
 * first inflating the store the object will be a List, not a Set.
 * @param  {Store} state
 * @return {Store}
 */
function verifyLoadingSet(state) {
    const loadingSet = state.get(RESOURCE_LOADING_SET_KEY, Immutable.Set());
    if (!loadingSet.add) {
        return state.set(RESOURCE_LOADING_SET_KEY, loadingSet.toSet());
    }
    return state;
}

/**
 * State subtree reducer for `resources`.
 */
export default function update(state = DEFAULT_RESOURCE_STATE, action) {
    state = verifyLoadingSet(state);
    const { type } = action;
    return ACTIONS.hasOwnProperty(type) ?
        ACTIONS[type](state, action) :
        state;
}
