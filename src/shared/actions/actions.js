import {
    REQUEST_POST,
    RECEIVE_POST,
    REQUEST_POSTS_INDEX,
    RECEIVE_POSTS_INDEX,
    SELECT_POST,
    DB_POSTS,
    FRESH_THRESH,
    RECEIVE_TIMESTAMP_KEY, RECEIVE_INDEX_TIMESTAMP_KEY,
    IS_FETCHING_KEY, IS_FETCHING_INDEX_KEY
} from '../constants';
import fetch from 'isomorphic-fetch';



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
    return dispatch => {
        dispatch(requestPost(id));
        return fetch(`${DB_POSTS}/${id}`)
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
