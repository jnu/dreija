import { OPEN_POST } from '../constants';

export default function openPost(id) {
    return {
        type: OPEN_POST,
        id: id
    };
}
