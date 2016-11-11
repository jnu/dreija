export default {
    users: {
        map: doc => {
            if (doc.type === 'user') {
                var id = doc._id;
                var val = {
                    id: doc._id,
                    rev: doc._rev,
                    type: doc.type,
                    name: doc.name,
                    roles: doc.roles || []
                };

                /* Index by id. */
                emit(id, val);

                /* Index as well by OAuth ID. When adding OAuth providers,
                 *  add additional indexes here.
                 */
                emit('googleId-' + doc.googleId, val);
            }
        }
    }
};
