var React = require('react');
require('./components/ui/shared/Header');


module.exports = {

    _cmp: [],

    start: function() {
        var rootNodes = document.querySelectorAll('[data-react-class]');

        this._cmp = Array.prototype.map.call(rootNodes, function(node) {
            var cls = node.getAttribute('data-react-class');
            var strProps = node.getAttribute('data-react-props');
            var props = JSON.parse(strProps);
            var path = './components/' + cls;
            var Cmp = require(path.replace('/./', '/'));

            var activeCmp = Cmp(props);

            React.renderComponent(activeCmp, node);

            return activeCmp;
        });
    },


};
