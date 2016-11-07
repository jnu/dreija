import fetch from 'isomorphic-fetch';


export class Auth {

    getUserRoles() {
        console.log("GETTING USER ROLES")
        return this.getProfile().then(({ roles }) => roles);
    }

    getProfile() {
        return fetch('/auth/info');
    }

}
