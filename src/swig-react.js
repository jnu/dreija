/**
 * Renders a React component as a string in place.
 *
 * Inspired by the [react-rails gem](https://github.com/reactjs/react-rails),
 * and renders templates consistent with their View Helper.
 *
 * @alias react
 *
 * @example
 * // Render a component with no props
 * {% react 'Header' %}
 * // <div data-react-class="./ui/shared/Header">...</div>
 *
 * @example
 * // Render a component with some props
 * // props = { name: 'John' };
 * {% react 'HelloMessage' with props %}
 * // <div data-react-class="./ui/shared/HelloMessage" data-react-props="{&quot;name&quot;:&quot;John&quot;}">...</div>
 *
 * @example
 * // Render a component with props in a custom element
 * {% react 'HelloMessage' with props in 'span' %}
 * // <span data-...>...</span>
 *
 * @example
 * // Render a component with props in a more customized element
 * // el = { tag: 'span', class: 'foo', id: 'hello' };
 * {% react './ui/shared/HelloMessage' with props in el %}
 * // <span class="foo" id="hello" data-...>...</span>
 *
 * @param {string|var}    modulePath Path to ReactComponent module
 * @param {Literal}       [with]     Literal string "with"
 * @param {object}        [props]    Properties to pass to ReactComponent
 * @param {Literal}       [in]       Literal string "in"
 * @param {string|object} [tag]      String specifying tag to use as container,
 *                                   or an object describing such a tag. In the
 *                                   object, the "tag" key must be defined, and
 *                                   every other key will be attached as an
 *                                   attribute to the tag.
 */

var React = require('react');
var components = require('components');

var STR_WITH = "with";
var STR_IN = "in";fdsa

var name = exports.name = 'react';
var ends = exports.ends = false;
var blockLevel = exports.blockLevel = false;

var compile = exports.compile = function(compiler, args) {
    var module = args.shift();
    var props = {};
    var container = { tag: 'div' };
    var output = "";
    var arg;
    var param;

    // Parse remaining arguments
    while (!!(arg = args.shift())) {
        switch (arg) {
            case STR_WITH:
                props = args.shift();
                break;
            case STR_IN:
                param = args.shift();
                if (param === 'object') {
                    // use an object directly
                    container = param;
                } else {
                    // interpret a non-object as `tag`
                    container.tag = param;
                }
                break;
            default:
                throw new Error('Unexpected argument "' + arg + '" in tag.');
        }
    }

    // Create start tag for containing node
    output = "<" + container.tag;
    // add attributes to node
    for (var key in container) {
        var val;
        if (container.hasOwnProperty(key) && key !== 'tag') {
            val = container[key].replace('"', "&quot;");
            output += ' ' + key + '="' + val + '"';
        }
    }
    output += ">";

    // Render React component
    var componentClass = components[module]
    var component = new componentClass(props);
    output += React.renderComponentToString(component);

    // Close tag for containing node
    output += "</" + container.tag + ">";

    // Add command to append component to compiler's output content
    return "_output += " + output;
};

var parse = exports.parse = function(str, line, parser, types, stack, opts) {
    var module;

    parser.on(types.STRING, function(token) {
        if (!module) {
            module = token.match;
            this.out.push(module);
            return;
        }

        return true;
    });

    parser.on(types.VAR, function(token) {
        if (!module) {
            module = token.match;
            return true;
        }

        if (token.match === STR_WITH || token.match === STR_IN) {
            this.out.push(token.match);
            return false;
        }

        return true;
    });

    return true;
};

// helper method to call #setTag on swig
exports.setTagOn = function(swig) {
    swig.setTag(name, parse, compile, ends, blockLevel);
};
