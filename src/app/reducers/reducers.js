import Immutable from 'immutable';
import {
    REQUEST_PAGE, RECEIVE_PAGE,
    REQUEST_POST, RECEIVE_POST,
    REQUEST_POSTS_INDEX, RECEIVE_POSTS_INDEX,
    POST_VIEW, PAGE_VIEW,
    SELECT_POST, SELECT_PAGE
} from '../constants';



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
    const { rawIndex } = action;

    const data = rawIndex.rows.reduce((agg, entity) => {
        agg[entity.id] = entity.value;
        return agg;
    }, {});

    return state.mergeDeep({
        isFetchingIndex: false,
        data
    });
}



export default function update(state = Immutable.fromJS({}), action) {
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
