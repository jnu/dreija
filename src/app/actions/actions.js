import {
    REQUEST_RESOURCE,
    RECEIVE_RESOURCE,
    REQUEST_POSTS_INDEX,
    RECEIVE_POSTS_INDEX,
    SELECT_POST,
    SELECT_PAGE,
    DB_ROOT,
    DB_POSTS,
    DB_PAGES
} from '../constants';
import fetch from 'isomorphic-fetch';



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Resource
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function requestResource(id) {
    return {
        type: REQUEST_RESOURCE,
        id,
        timestamp: Date.now()
    };
}

function receiveResource(id, json) {
    return {
        type: RECEIVE_RESOURCE,
        page: json.data,
        timestamp: Date.now()
    };
}

export function selectPage(id) {
    return {
        type: SELECT_PAGE,
        id,
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
    return dispatch => {
        dispatch(requestResource(id));
        return fetch(`${DB_POSTS}/${id}`)
            .then(req => req.json())
            .then(json => dispatch(receiveResource(id, json)));
    };
}

function shouldFetchResource(state, id) {
    const resource = state.data[id];

    if (!resource) {
        return true;
    }

    if (resource.isFetching) {
        return false;
    }
}

export function fetchResourceIfNecessary(id) {
    return (dispatch, getState) => {
        if (shouldFetchResource(getState(), id)) {
            return dispatch(fetchPost(id));
        }
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
    return dispatch => {
        dispatch(requestIndex());
        return fetch(`${DB_POSTS}`)
            .then(req => req.json())
            .then(json => dispatch(receiveIndex(json)));
    };
}

function shouldFetchIndex(state) {
    return !state.isFetchingIndex;
}

export function fetchIndexIfNecessary() {
    return (dispatch, getState) => {
        if (shouldFetchIndex(getState())) {
            return dispatch(fetchIndex());
        }
    };
}
