import { BROWSER } from './env';

export const REQUEST_RESOURCE = 'request_resource';
export const RECEIVE_RESOURCE = 'receive_page';

export const REQUEST_POSTS_INDEX = 'request_posts_index';
export const RECEIVE_POSTS_INDEX = 'receive_posts_index';

export const POST_VIEW = 'post';
export const PAGE_VIEW = 'page';
export const HOME_VIEW = 'home';

export const SELECT_POST = 'select_post';
export const SELECT_PAGE = 'select_page';

export const DB_ROOT = BROWSER ? '/db' : 'http://127.0.0.1:3030/db';
export const DB_POSTS = `${DB_ROOT}/posts`;
export const DB_PAGES = `${DB_ROOT}/pages`;
