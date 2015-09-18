/**
 * Home page
 */

import React from 'react/addons';
import { createStaticPage } from 'ui/Factories';

const HOME_RESOURCE_ID = 'home';

export default createStaticPage(HOME_RESOURCE_ID, {

    render: function() {
        const data = this.props.data.home;
        return (
            <div>
            home page
                <div>{ data.title }</div>
                <div>{ data.content }</div>
            </div>

        );
    }

});
