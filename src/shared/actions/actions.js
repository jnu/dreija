import {
    REQUEST_POST,
    RECEIVE_POST,
    REQUEST_POSTS_INDEX,
    RECEIVE_POSTS_INDEX,
    SELECT_POST,
    DB_POSTS,
    FRESH_THRESH,
    RECEIVE_TIMESTAMP_KEY, RECEIVE_INDEX_TIMESTAMP_KEY,
    IS_FETCHING_KEY, IS_FETCHING_INDEX_KEY,

    RESOURCE_STORE_KEY,
    DB_ROOT,
    REQUEST_RESOURCE,
    REQUEST_RESOURCE_LIST,
    RECEIVE_RESOURCE,
    RECEIVE_RESOURCE_LIST,
    RESOURCE_LOADED_KEY,
    RESOURCE_LOADING_KEY,
    REQUEST_SEND_RESOURCE,
    RECEIVE_SEND_RESOURCE
} from '../constants';
import { BROWSER } from '../env';
import fetch from 'isomorphic-fetch';


/**
 * A smart fetch operation that reads header data from the current store in a
 * non-browser environment.
 * @param  {String} url
 * @param  {StoreState} state - current store state
 * @param  {FetchOpts?} opts - custom fetch opts. See `fetch` for more info.
 * @return {Promise<any>}
 */
function smartFetch(url, state, opts = {}) {
    if (!BROWSER) {
        // Use any custom headers if they're passed in
        const headers = opts.headers || {};
        const user = state.user;
        if (user) {
            // TODO Merge existing cookies instead of overwriting? Not sure I
            // see a good use case for this.
            headers.cookie = user.cookie;
            // TODO. csrf?
        }
        return fetch(url, { ...opts, headers });
    }
    // In a browser, headers will be handled for us if we tell fetch it's ok.
    // Note: it's possible to overwrite credentials with custom opts as desired.
    else {
        return fetch(url, { credentials: 'same-origin', ...opts });
    }
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Resource
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function requestPost(id) {
    return {
        type: REQUEST_POST,
        id,
        timestamp: Date.now()
    };
}

function receivePost(id, json) {
    return {
        type: RECEIVE_POST,
        id,
        data: json,
        timestamp: Date.now()
    };
}

export function selectPost(id) {
    return {
        type: SELECT_POST,
        id,
        timestamp: Date.now()
    };
}

function fetchPost(id) {
    return (dispatch, getState) => {
        dispatch(requestPost(id));
        return smartFetch(`${DB_POSTS}/${id}`, getState())
            .then(req => req.json())
            .then(json => dispatch(receivePost(id, json)));
    };
}

function shouldFetchPost(state, id) {
    const data = state.root.get('data');

    if (!data) {
        return true;
    }

    const post = data.get('id');

    // If there is no post with that ID, fetch it.
    if (!post) {
        return true;
    }

    // If post is lacking content (e.g. it has only been fetched by the index)
    // then fetch the full thing.
    if (!post.get('content') && !post.get(IS_FETCHING_KEY)) {
        return true;
    }

    // Re-fetch stale posts or posts that are missing a receive timestamp for
    // some reason.
    const receiveTs = post.get(RECEIVE_TIMESTAMP_KEY);
    if (!receiveTs || (Date.now() - receiveTs) > FRESH_THRESH) {
        return true;
    }

    return false;
}

export function fetchPostIfNecessary(id) {
    return (dispatch, getState) => {
        if (shouldFetchPost(getState(), id)) {
            return dispatch(fetchPost(id));
        }
    };
}




// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Resource: fetch single resources from view by key
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function shouldFetchResource(state, view, key) {
    return !(
        state.hasOwnProperty(view) && (                                           // view is present
            state[view].getIn([RESOURCE_STORE_KEY, key, RESOURCE_LOADED_KEY]) ||  // is loaded
            state[view].getIn([RESOURCE_STORE_KEY, key, RESOURCE_LOADING_KEY])    // is loading
        )
    );
}

function requestResource(view, key) {
    return {
        type: REQUEST_RESOURCE,
        timestamp: Date.now(),
        view,
        key
    };
}

function receiveResource(view, key, data = {}) {
    return {
        type: RECEIVE_RESOURCE,
        timestamp: Date.now(),
        view,
        key,
        data
    };
}

function fetchResource(view, key) {
    return (dispatch, getState) => {
        dispatch(requestResource(view, key));
        return smartFetch(`${DB_ROOT}/view/${view}/${key}`, getState())
            .then(res => res.json())
            .then(json => dispatch(receiveResource(view, key, json.resource)));
    };
}

export function ensureResource(view, key) {
    return (dispatch, getState) => {
        if (shouldFetchResource(getState(), view, key)) {
            return dispatch(fetchResource(view, key));
        }
    };
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Index: Resource Lists
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function shouldFetchResourceList(state, view, key = '') {
    return !(
        state.hasOwnProperty(view) && (              // view is present
            state[view].get(RESOURCE_LOADED_KEY) ||  // resource is loaded
            state[view].get(RESOURCE_LOADING_KEY)    // resource is loading
        )
    );
}

function requestResourceList(view, key = '') {
    return {
        type: REQUEST_RESOURCE_LIST,
        timestamp: Date.now(),
        view,
        key
    };
}

function receiveResourceList(view, key = '', data = {}) {
    return {
        type: RECEIVE_RESOURCE_LIST,
        timestamp: Date.now(),
        view,
        key,
        data
    };
}

function fetchResourceList(view, key = '') {
    return (dispatch, getState) => {
        dispatch(requestResourceList(view, key));
        return smartFetch(`${DB_ROOT}/view/${view}?q=${key}`, getState())
            .then(res => res.json())
            .then(json => dispatch(receiveResourceList(view, key, json.resource)));
    };
}

export function ensureResourceList(view, key = '') {
    return (dispatch, getState) => {
        if (shouldFetchResourceList(getState(), view, key)) {
            return dispatch(fetchResourceList(view, key));
        }
    };
}

function receiveSendResource(type, doc, data) {
    return {
        type: RECEIVE_SEND_RESOURCE,
        data
    };
}

function requestSendResource(data) {
    return {
        type: REQUEST_SEND_RESOURCE,
        data
    };
}

export function sendResource(type, doc) {
    return (dispatch, getState) => {
        const data = { ...doc, type };
        requestSendResource(data);
        return smartFetch(
                `${DB_ROOT}/update`,
                getState(),
                { method: 'POST', data }
            )
            .then(res => res.json())
            .then(json => dispatch(receiveSendResource(type, doc, json)));
    };
}










// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Index
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function requestIndex() {
    return {
        type: REQUEST_POSTS_INDEX,
        timestamp: Date.now()
    };
}

function receiveIndex(json) {
    return {
        type: RECEIVE_POSTS_INDEX,
        timestamp: Date.now(),
        rawIndex: json
    };
}

function fetchIndex() {
    return (dispatch, getState) => {
        dispatch(requestIndex());
        return smartFetch(`${DB_POSTS}`, getState())
            .then(req => req.json())
            .then(json => dispatch(receiveIndex(json)));
    };
}

function shouldFetchIndex(state) {
    return !state.root.get(IS_FETCHING_INDEX_KEY) && (
        !state.root.get(RECEIVE_INDEX_TIMESTAMP_KEY) ||
        (Date.now() - state.root.get(RECEIVE_INDEX_TIMESTAMP_KEY)) > FRESH_THRESH
    );
}

export function fetchIndexIfNecessary() {
    return (dispatch, getState) => {
        if (shouldFetchIndex(getState())) {
            return dispatch(fetchIndex());
        }
    };
}

export function forceFetchIndex() {
    return dispatch => dispatch(fetchIndex());
}
