import { OPEN_PAGE } from '../constants';

export default function openPage(id) {
    return {
        type: OPEN_PAGE,
        id: id
    };
}
