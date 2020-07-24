const should = require('chai').should();
const Bus = require('../modules/Bus');

describe("Bus", function(){
    const cb = function(){};
    let sharedSub;

    it('Register listener', function(){
        sharedSub = Bus.subscribe('test', cb);
        Bus.subscriptions.should.have.property('test');
        Bus.subscriptions.test.should.have.property(sharedSub.id);
    });

    it('Unsubscribe properly', function(){     
        const id = sharedSub.id;
        sharedSub.unsubscribe();
        Bus.subscriptions.should.not.have.property('test');  
    });

    it('Register multiple liteners', function(){
        const sub1 = Bus.subscribe('multitest', cb);
        const sub2 = Bus.subscribe('multitest', cb);

        const listenersObj = Bus.subscriptions.multitest;
        Object.keys(listenersObj).length.should.equal(2);
        sub1.unsubscribe();
        sub2.unsubscribe();
    });

    it('Emitting events', function(done){
        sub = Bus.subscribe('emittest', done);
        Bus.emit('emittest');
        sub.unsubscribe();
    });

    it('Passing data', function(done){
        const dataToPass = 'test';
        let checkFunc = function(passedData) {
            if (passedData == dataToPass) done()
            else {
                console.log(passedData);
                return false;
            }
        };

        sub = Bus.subscribe('dataTest', checkFunc);
        Bus.emit('dataTest', 'test')
        sub.unsubscribe();
    });

    it('Automatically unsub listeners with \'once\' parameter', function(){
        const sub = Bus.subscribe('onceTest', cb, true);
        Bus.emit('onceTest');
        Bus.subscriptions.should.not.have.property('onceTest');
    });
});