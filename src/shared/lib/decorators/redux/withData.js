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
            send,
            derive = DEFAULT_DERIVE
        } = opts;

        if (fetch) {
            // Attach fetch as static / prototype
            Cls.fetchData = fetch;
            Cls.prototype.fetchData = function _fetchData(...args) {
                return fetch(this.props.dispatch, ...args);
            };

            // Fetch data when component is mounted.
            const originalDidMount = Cls.prototype.componentDidMount;
            Cls.prototype.componentDidMount = function _cmpDidMount(...args) {
                const { dispatch, params } = this.props;
                fetch(dispatch, params);
                return originalDidMount && originalDidMount.apply(this, ...args);
            };

            // Fetch data when component's params are changing. This makes the
            // naive assumption that if params change, content will also change.
            // We could be more clever about checking.
            const originalWillReceiveProps = Cls.prototype.componentWillReceiveProps;
            Cls.prototype.componentWillReceiveProps = function _cmpWillRcvProps(props, ...args) {
                const currentParams = this.props.params;
                const nextParams = props.params;

                if (currentParams !== nextParams) {
                    fetch(props.dispatch, nextParams);
                }

                return originalWillReceiveProps && originalWillReceiveProps.apply(this, [props].concat(args));
            };
        }

        if (send) {
            // Add a `sendData` method
            Cls.sendData = send;
            Cls.prototype.sendData = function _sendData(...args) {
                return send(this.props.dispatch, this.props, ...args);
            };
        }

        // Connect to store
        return connect(derive)(Cls);
    };
}
