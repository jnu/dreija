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
