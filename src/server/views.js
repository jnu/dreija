export function compile(fn) {
    const body = fn.toString();
    // TODO actual compiling, could inline util functions, etc.
    return body.replace(/[\n\t]/g, ' ');
}



export default {
    views: {
        index: {
           map: compile(doc => {
                if (doc.status === 'published' && (doc.type === 'post' || doc.type === 'page')) {
                    emit(doc._id, {
                        title: doc.title || 'Untitled',
                        type: doc.type || 'post',
                        category: doc.category || '',
                        created: doc.created || new Date(0),
                        whichiwrote: doc.whichiwrote,
                        _id: doc._id,
                        _rev: doc._rev,
                        sprite: doc.sprite || '0 0',
                        oldUrl: doc.oldUrl,
                        snippet: doc.snippet || '',
                        author:doc.author || '',
                        image: doc.image || null,
                        callback: doc.callback || null
                    });
                }
            })
        },
        admin: {
            map: compile(doc => {
                if ((doc.type === 'post' || doc.type === 'page')) {
                    emit(doc._id, {
                        title: doc.title || 'Untitled',
                        type: doc.type || 'post',
                        category: doc.category || '',
                        created: doc.created || new Date(0),
                        whichiwrote: doc.whichiwrote,
                        _id: doc._id,
                        _rev: doc._rev,
                        sprite: doc.sprite || '0 0',
                        oldUrl: doc.oldUrl,
                        snippet: doc.snippet || '',
                        author:doc.author || '',
                        image: doc.image || null,
                        callback: doc.callback || null
                    });
                }
            })
        },
        users: {
            map: compile(doc => {
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
            })
        }
    }
}
