import * as assert from 'assert';
import { format } from '../swiftFormat';
import { createSwiftFile, readSwiftFile } from './testUtil';

// Our input file
const unformattedCode = `func sum(a:Int,b:Int)->Int{
    return a + b
}`;

// This is the desired output
const formattedCode = `func sum(a: Int, b: Int) -> Int {
    return a + b
}
`;

suite('Format Tests', () => {
    test('formatting', async () => {
        const fileName = createSwiftFile(unformattedCode);
        await format(fileName);
        const data = readSwiftFile(fileName);
        assert.equal(data, formattedCode);
    });
});
