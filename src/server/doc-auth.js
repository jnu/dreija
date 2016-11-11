import { intersection } from 'lodash';


export class DocAuth {

    constructor(tests = []) {
        this._tests = tests.map(this._compileTest);
    }

    /**
     * Check whether a user with the provided roles would be allowed to edit a
     * given document.
     * @param  {Document} doc
     * @param  {String[]} roles
     * @return {Boolean}
     */
    validate(doc, roles = false) {
        return this._tests.every(test => test(doc, roles));
    }

    /**
     * Given a test config, construct a function that takes a document and a
     * list of user roles and return true/false based on whether the user
     * should be allowed access to this document.
     * @param  {DocAuthTestDescriptor} test
     * @return {(Document, string[]) => boolean}
     */
    _compileTest(test) {
        let testDoc;
        const {
            match,
            auth = true
        } = test;

        const rolesRequired = Array.isArray(auth) ? auth : auth ? [] : false;

        // No need to match document if just making public.
        if (!rolesRequired) {
            return () => true;
        }

        if (match === '*') {
            testDoc = () => true;
        } else if (match.field) {
            const { field, value } = match;
            if (value instanceof RegExp) {
                testDoc = doc => !!doc && value.test(doc[field]);
            } else {
                testDoc = doc => !!doc && value === doc[field];
            }
        } else if (match instanceof Function) {
            testDoc = match;
        }

        // Construct test for restricted documents.
        return (doc, roles) => {
            // If doc matches, validate auth
            if (testDoc(doc)) {
                // If user has *no* perms this fails, since this test assumes
                // that the doc is private.
                if (!roles) {
                    return false;
                }
                return intersection(rolesRequired, roles).length === rolesRequired.length;
            }
            // If doc doesn't match, this test passes.
            return true;
        };
    }

}
