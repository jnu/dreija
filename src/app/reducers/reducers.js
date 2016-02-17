import Immutable from 'immutable';
import {
    REQUEST_POST, RECEIVE_POST,
    REQUEST_POSTS_INDEX, RECEIVE_POSTS_INDEX,
    SELECT_POST,
    IS_FETCHING_KEY, IS_FETCHING_INDEX_KEY,
    RECEIVE_TIMESTAMP_KEY, RECEIVE_INDEX_TIMESTAMP_KEY
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
        data: {
            [id]: {
                id,
                [IS_FETCHING_KEY]: true
            }
        }
    });
}


function updateWithReceivePost(state, action) {
    let { id, data, timestamp } = action;

    return state.mergeDeep({
        data: {
            [id]: Object.assign({},
                data,
                {
                    [IS_FETCHING_KEY]: false,
                    [RECEIVE_TIMESTAMP_KEY]: timestamp
                }
            )
        }
    });
}


function updateWithRequestIndex(state, action) {
    return state.mergeDeep({
        [IS_FETCHING_INDEX_KEY]: true
    });
}


function updateWithReceiveIndex(state, action) {
    const { rawIndex, timestamp } = action;

    const data = rawIndex.rows.reduce((agg, entity) => {
        agg[entity.id] = entity.value;
        return agg;
    }, {});

    return state.mergeDeep({
        [IS_FETCHING_INDEX_KEY]: false,
        [RECEIVE_INDEX_TIMESTAMP_KEY]: timestamp,
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
