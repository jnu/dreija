import { connect } from 'react-redux';


const DEFAULT_DERIVE = () => ({});

/**
 * Hook a React component up data. Can reference the store directly by passing
 * a `derive` method and/or trigger an action to receive external data with
 * a `fetch` method. Fetch methods are called in server-side rendering as well
 * as when components are mounted client-side.
 * @param  {Object} opts
 * @return {Component => Component}
 */
export function withData(opts = {}) {
    return Cls => {
        const {
            fetch,
            derive = DEFAULT_DERIVE
        } = opts;

        if (fetch) {
            // Attach static fetch method.
            Cls.fetchData = fetch;

            // Fetch data when component is mounted.
            const originalDidMount = Cls.prototype.componentDidMount;
            Cls.prototype.componentDidMount = function _cmpDidMount(...args) {
                const { dispatch, params } = this.props;
                fetch(dispatch, params);
                return originalDidMount && originalDidMount.apply(this, ...args);
            };
        }

        // Connect to store
        return connect(derive)(Cls);
    };
}
