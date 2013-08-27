describe('Blogmachine', function(){
    describe("Blogmachine.Error", function(){
        it('should create a new undefined Error message', function() {
            var _error = new BlogMachine.Error;
            expect(_error instanceof BlogMachine.Error).toBe(true);
            expect(_error.msg).toBe(undefined);
        });

        it('should create Error with message="test"', function() {
            var _error = new BlogMachine.Error("test");
            expect(_error instanceof BlogMachine.Error).toBe(true);
            expect(_error.msg).toBe("test");
        });
    });
});