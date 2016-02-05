import {
    REQUEST_RESOURCE,
    RECEIVE_RESOURCE,
    REQUEST_INDEX,
    RECEIVE_INDEX,
    SELECT_POST,
    SELECT_PAGE,
    COUCH_ROOT,
    COUCH_VIEW_ROOT
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

function fetchPage(id) {
    return dispatch => {
        dispatch(requestResource(id));
        return fetch(`${COUCH_ROOT}/${id}`)
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
            return dispatch(fetchPage(id));
        }
    };
}



// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Index
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function requestIndex() {
    return {
        type: REQUEST_INDEX,
        timestamp: Date.now()
    };
}

function receiveIndex() {
    return {
        type: RECEIVE_INDEX,
        timestamp: Date.now()
    };
}

function fetchIndex() {
    return dispatch => {
        dispatch(requestIndex());
        return fetch(`${COUCH_VIEW_ROOT}/index`)
            .then(req => req.json())
            .then(json => dispatch(receiveIndex(json)));
    };
}

function shouldFetchIndex(state) {
    return state.isFetchingIndex;
}

export function fetchIndexIfNecessary() {
    return (dispatch, getState) => {
        if (shouldFetchIndex(getState())) {
            return dispatch(fetchIndex());
        }
    };
}
