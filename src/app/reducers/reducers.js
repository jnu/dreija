import Immutable from 'immutable';
import {
    REQUEST_POST, RECEIVE_POST,
    REQUEST_POSTS_INDEX, RECEIVE_POSTS_INDEX,
    SELECT_POST
} from '../constants';



function updateWithSelectedPost(state, action) {
    let { id } = action;

    return state.mergeDeep({
        currentId: id
    });
}


function updateWithRequestPost(state, action) {
    let { id } = action;

    return state.mergeDeep({
        data: { [id]: { id, isFetching: true } }
    });
}


function updateWithReceivePost(state, action) {
    let { id, data } = action;

    return state.mergeDeep({
        data: { [id]: Object.assign({}, data, { isFetching: false }) }
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
        case REQUEST_POST:
            return updateWithRequestPost(state, action);
        case RECEIVE_POST:
            return updateWithReceivePost(state, action);
        case REQUEST_POSTS_INDEX:
            return updateWithRequestIndex(state, action);
        case RECEIVE_POSTS_INDEX:
            return updateWithReceiveIndex(state, action);
        case SELECT_POST:
            return updateWithSelectedPost(state, action);
        default:
            return state;
    }
}
