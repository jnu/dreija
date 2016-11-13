import { RESOURCE_STORE_KEY } from '../constants';


/**
 * Pull a resource from the store specified by the given path.
 * @param  {Store} state
 * @param  {...String} path
 * @return {Object?}
 */
export default (state, ...path) => {
    const { resource } = state;

    if (!resource) {
        return;
    }

    const realPath = new Array(path.length * 2);

    for (let i = 0; i < realPath.length; i++) {
        if (i % 2) {
            realPath[i] = RESOURCE_STORE_KEY;
        } else {
            realPath[i] = path[i >> 1];
        }
    }

    return resource.getIn(realPath);
};
