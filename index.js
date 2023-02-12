let {Parser} = require('./Parser');

let readline = require('readline');
let reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
let lines = [];
reader.prompt();

reader.on('line', function (cmd) {
    lines.push(cmd);
});

reader.on('close', function () {
    const parser = new Parser(lines);
    parser.parse();
    process.exit(0);
});