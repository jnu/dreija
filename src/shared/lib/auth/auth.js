import fetch from 'isomorphic-fetch';


export class Auth {

    getUserRoles() {
        return this.getProfile().then(({ roles }) => roles);
    }

    getProfile() {
        return fetch('/auth/info', { credentials: 'same-origin' })
            .then(d => d.json());
    }

}
