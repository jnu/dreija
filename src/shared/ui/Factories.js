
import React from 'react/addons';
import { STATIC } from 'constants/ResourceConstants';

export function createStaticPage(resourceId, methods = {}) {
    return React.createClass(Object.assign({

        statics: {
            getContentDescriptor: function() {
                return {
                    id: resourceId,
                    type: STATIC
                };
            }
        },

        render: function() {
            const content = this.props.data[resourceId] || {};
            return (
                <div className={ `static-container ${resourceId}` }>
                    <h2>
                        { content.title }
                    </h2>
                    <div>
                        { content.content }
                    </div>
                </div>
            );
        }

    }, methods));
}
