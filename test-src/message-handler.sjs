var sinon = require('sinon');
var assert = require('better-assert');
var equal = require('deep-eql');
var inspect = require('util').inspect;
var format = require('util').format;

const debug = false;
const logfn = debug ? console.log.bind(console) : function () {};
const logger = {debug: logfn, info: logfn, notice: logfn, warn: logfn, error: logfn};

const MessageHandler = require('../lib/message-handler.js');
const Message = require('../lib/message.js');
const Q = require('q');

const id = (function () {
    var ix = 0;
    return function () {
        ix += 1;
        return ix;
    }
})();

const prefix = 'irc.mibbit.net';
const command = 'generic';
const arg1 = 'arg1';
const arg2 = 'arg2';
const argr = 'rest args';
const raw = format(':%s %s %s %s :%s', prefix, command, arg1, arg2, argr);

describe 'Message Parsers' {
    var parser, receiver;

    beforeEach {
        logfn(/* newline */);

        receiver = {_id: id()};
        parser = MessageHandler(receiver);
    }

    describe '#parse' {
        var retval, evtval;

        beforeEach (done) {
            parser.on('generic', function (message) {
                evtval = message;
                done();
            });

            retval = parser.parse(raw);
        }

        it 'Return value' {
            assert(retval.prefix === prefix);
            assert(retval.command === command);
            assert(retval.params[0] === arg1);
            assert(retval.params[1] === arg2);
            assert(retval.params[2] === argr);
            assert(retval.receiver === receiver);
        }

        it 'Event Value' {
            assert(evtval.prefix === prefix);
            assert(evtval.command === command);
            assert(evtval.params[0] === arg1);
            assert(evtval.params[1] === arg2);
            assert(evtval.params[2] === argr);
            assert(evtval.receiver === receiver);
        }

        it 'Emit and Return value are the same' {
            assert(retval === evtval);
        }
    }

    describe '`*` event' {
        it 'is called with every function' (done) {
            var count = 0;

            parser.on('*', function (message) {
                count += 1;

                if (count === 2) {
                    done();
                }
            });

            parser.parse(raw);
            parser.parse(raw);
        }
    }
}