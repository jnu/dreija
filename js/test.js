
var requirejs = require('requirejs'),
    chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    should = chai.should();

requirejs.config({
    baseUrl: 'js',
    nodeRequire: require
});

var main = requirejs('main');


describe('Blogmachine', function(){
    describe("Blogmachine.Error", function(){
        it('should create a new undefined Error message', function() {
            var _error = new BlogMachine.Error;
            expect(_error instanceof BlogMachine.Error).to.equal(true);
            expect(_error.msg).to.equal(undefined);
        });

        it('should create Error with message="test"', function() {
            var _error = new BlogMachine.Error("test");
            expect(_error instanceof BlogMachine.Error).to.equal(true);
            expect(_error.msg).to.equal("test");
        });
    });
});