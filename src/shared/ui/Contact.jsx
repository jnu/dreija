
import React from 'react/addons';
import {createStaticPage} from 'ui/Factories';

const CONTACT_RESOURCE_ID = 'contact';

export default createStaticPage(CONTACT_RESOURCE_ID, {
    render: function() {
        return (
            <div>Contact me</div>
        );
    }
});
