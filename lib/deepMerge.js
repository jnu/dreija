/**
 * @fileOverview Deep object merging and cloning
 */

/**
 * Get a non-ridiculous type of an object. All of the normal JS types of
 * primitives are returned, but more specificity is added in cases where
 * `typeof foo === 'object'`. In particular:
 *
 *   betterType(null) === 'null'
 *   betterType(Object.create(null)) === 'PureObject'
 *   betterType([]) === 'Array'
 *   betterType({}) === 'Object'
 *   betterType(new Date()) === 'Date'
 *   betterType(/foo/g) === 'RegExp'
 *
 * And in general:
 *
 *   function F() {}
 *   betterType(new F()) === 'F'
 *
 * @param  {any} obj
 * @return {string}
 */
function betterType(obj) {
    var jsType = typeof obj;
    switch (jsType) {
        case 'object':
            if (obj === null) {
                return 'null';
            }

            var cons = obj.constructor;
            if (!cons) {
                return 'PureObject';
            }

            return cons.name;
        default:
            return jsType;
    }
}

/**
 * Merge a pair of objects. The target will be mutated if it is mutable. The
 * source will be cloned wherever a logical clone is possible. Uncloneable
 * items are any objects with non-Object constructors (Date, RegExp, etc.).
 *
 * Passing null for target still has the effect of deep-cloning the source.
 *
 * @param  {any} target
 * @param  {any} source
 * @return {any}        Type of source
 */
function deepMergePair(target, source) {
    var targetType = betterType(target);
    var sourceType = betterType(source);

    switch (sourceType) {
        case 'PureObject':
        case 'Object':
            switch (targetType) {
                case 'PureObject':
                case 'Object':
                    Object.keys(source).forEach(function(key) {
                        var targetVal = target[key];
                        var sourceVal = source[key];
                        target[key] = deepMergePair(targetVal, sourceVal);
                    });
                    return target;
                default:
                    return deepMergePair({}, source);
            }
        case 'Array':
            var clonedSource = source.map(function(val) {
                return deepMergePair(null, val);
            });
            switch (targetType) {
                case 'Array':
                    target.push.apply(target, clonedSource);
                    return target;
                default:
                    return clonedSource;
            }

        default:
            return source;

    }
}



/**
 * Deep merge an arbitrary number of objects. Object farthest to left in
 * arguments list will be mutated if it is mutable.
 * @param {...any} objects - objects to merge
 * @return {any} Type of the right-most argument.
 */
module.exports = function deepMerge(/* ...objects */) {
    var objects = Array.prototype.slice.call(arguments);

    if (!objects.length) {
        return;
    }

    var target = objects[0];
    var sources = objects.slice(1);
    var source;

    while (source = sources.shift()) {
        deepMergePair(target, source);
    }

    return target;
};
