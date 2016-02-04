import {
    REQUEST_POST,
    RECEIVE_POST,
    REQUEST_POSTS_INDEX,
    RECEIVE_POSTS_INDEX,
    SELECT_POST
} from '../constants';


export function requestPost(id) {
    return {
        type: REQUEST_POST,
        id,
        timestamp: Date.now()
    };
}


export function receivePost(id, json) {
    return {
        type: RECEIVE_POST,
        post: json.data,
        timestamp: Date.now()
    };
}


export function requestPostsIndex() {
    return {
        type: REQUEST_POSTS_INDEX,
        timestamp: Date.now()
    };
}


export function receivePostsIndex(json) {
    return {
        type: RECEIVE_POSTS_INDEX,
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
