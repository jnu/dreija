import {
    REQUEST_PAGE,
    RECEIVE_PAGE,
    SELECT_PAGE
} from '../constants';



export function requestPage(id) {
    return {
        type: REQUEST_PAGE,
        id,
        timestamp: Date.now()
    };
}

export function receivePage(id, json) {
    return {
        type: RECEIVE_PAGE,
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
