import { BROWSER } from './env';

export const REQUEST_POST = 'request_post';
export const RECEIVE_POST = 'receive_post';

export const REQUEST_POSTS_INDEX = 'request_posts_index';
export const RECEIVE_POSTS_INDEX = 'receive_posts_index';

export const POST_VIEW = 'post';
export const HOME_VIEW = 'home';

export const SELECT_POST = 'select_post';

export const DB_ROOT = BROWSER ? '/db' : 'http://127.0.0.1:3030/db';
export const DB_POSTS = `${DB_ROOT}/posts`;

/**
 * Time in milliseconds after which to refresh data
 * @constant {Number}
 */
export const FRESH_THRESH = 1000 * 60 * 5;

export const RECEIVE_TIMESTAMP_KEY = '@@receive_timestamp';
export const RECEIVE_INDEX_TIMESTAMP_KEY = '@@receive_index_timestamp';
export const IS_FETCHING_KEY = '@@is_fetching';
export const IS_FETCHING_INDEX_KEY = '@@is_fetching_index';



export const RESOURCE_LOADING_SET_KEY = '@@resources_in_flight';
export const RESOURCE_STORE_KEY = '@@resources';
export const RESOURCE_LOADED_KEY = '@@is_loaded';
export const RESOURCE_LOADING_KEY = '@@is_loading';
export const REQUEST_RESOURCE_LIST = 'request_resource_list';
export const REQUEST_RESOURCE = 'request_resource';
export const RECEIVE_RESOURCE = 'receive_resource';
export const RECEIVE_RESOURCE_LIST = 'receive_resource_list';

export const REQUEST_SEND_RESOURCE = 'request_send_resource';
export const RECEIVE_SEND_RESOURCE = 'receive_send_resource';
