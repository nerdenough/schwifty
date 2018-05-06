import * as assert from 'assert';
import * as proxyquire from 'proxyquire';
import { EventEmitter } from 'events';

const emitter = new EventEmitter();
const { format } = proxyquire('../swiftFormat', {
    child_process: {
        spawn: (command: string, args: string[]) => {
            assert.equal(command, 'sourcekitten');
            assert.deepEqual(args, ['format', '--file', 'foo.swift']);
            return emitter;
        }
    }
});

suite('swiftFormat', () => {
    test('spawns sourcekitten with the correct arguments', (done) => {
        const promise = format('foo.swift');
        emitter.emit('exit');
        promise.then(done);
    });
});
