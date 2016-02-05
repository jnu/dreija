import Immutable from 'immutable';
import {
    REQUEST_PAGE, RECEIVE_PAGE,
    REQUEST_POST, RECEIVE_POST,
    REQUEST_POSTS_INDEX, RECEIVE_POSTS_INDEX,
    POST_VIEW, PAGE_VIEW,
    SELECT_POST, SELECT_PAGE
} from '../constants';


const initialState = Immutable.fromJS({
    view: POST_VIEW,
    currentId: '234356tef',
    data: {
        '234356tef': {
            id: '234356tef',
            title: 'foobarzap',
            category: 'a',
            snippet: 'foo',
            created: '2015-01-01',
            content: 'a b c d e f g h i j k l m n o p .... all fetched async',
            type: 'post'
        },
        'asdfasdfsdf': {
            id: 'asdfasdfsdf',
            title: 'zapbarfoo',
            category: 'b',
            snippet: 'bar',
            created: '2015-01-02',
            content: null,
            type: 'post',
            isFetching: false
        }
    }
});




function updateWithSelectedPage(state, action) {
    let { id } = action;

    return state.mergeDeep({
        currentId: id,
        view: PAGE_VIEW
    });
}

function updateWithSelectedPost(state, action) {
    let { id } = action;

    return state.mergeDeep({
        currentId: id,
        view: POST_VIEW
    });
}


function updateWithRequestResource(state, action) {
    let { id } = action;

    return state.mergeDeep({
        data: { [id]: { id }, isFetching: true }
    });
}


function updateWithReceiveResource(state, action) {
    let { id, post } = action;

    return state.mergeDeep({
        data: { [id]: post, isFetching: false }
    });
}


function updateWithRequestIndex(state, action) {
    return state.mergeDeep({
        isFetchingIndex: true
    });
}


function updateWithReceiveIndex(state, action) {
    let { data } = action;

    return state.mergeDeep({
        isFetchingIndex: false,
        data
    });
}



export default function update(state = initialState, action) {
    switch (action.type) {
        case REQUEST_PAGE:
            return updateWithRequestResource(state, action);
        case RECEIVE_PAGE:
            return updateWithReceiveResource(state, action);
        case REQUEST_POST:
            return updateWithRequestResource(state, action);
        case RECEIVE_POST:
            return updateWithReceiveResource(state, action);
        case REQUEST_POSTS_INDEX:
            return updateWithRequestIndex(state, action);
        case RECEIVE_POSTS_INDEX:
            return updateWithReceiveIndex(state, action);
        case SELECT_POST:
            return updateWithSelectedPost(state, action);
        case SELECT_PAGE:
            return updateWithSelectedPage(state, action);
        default:
            return state;
    }
}
