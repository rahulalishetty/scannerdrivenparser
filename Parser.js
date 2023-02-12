let {Scanner, COLON, SEMI} = require('./Scanner');

const RESERVED_VAR = 'var', RESERVED_NUMBER = 'number', RESERVED_STRING = 'string', RESERVED_RECORD = 'record', IDENTIFIER = 'identifier', TYPE = 'type', END = 'end';
const DECLARATION_STRUCTURE = [RESERVED_VAR, IDENTIFIER, COLON, TYPE, END];
const IDENTIFIER_REGEX = new RegExp( "^[a-zA-Z_][a-zA-Z0-9_]*$" );

class Parser {
    constructor(lines=[]) {
        this.lines = lines;
        this.result = [];
        this.currLine = 0;
    }

    parseLine(line, startStep= 0, prevResult=null,recordDepth=null) {
        if(this.currLine === this.lines.length) return;
        let scanner = new Scanner(line, this.curCursor?this.curCursor:null);
        if(scanner.peek() === -1) {
            this.currLine++;
            return;
        }
        let parseClosureHandle = parseClosure(scanner, startStep, prevResult, recordDepth);
        let {result, step, isRecord} = parseClosureHandle.process();
        if(isRecord) {
            if (scanner.peek() === -1) {
                this.currLine++;
                this.curCursor = 0;
            } else this.curCursor = scanner.cursor;
            const recordResult = [];
            let count = 0;
            while(!this.isRecordEnd()) {
                count++;
                recordResult.push(this.parseLine(this.lines[this.currLine], 1, [], recordDepth ? recordDepth + 1 : 1));
            }
            this.parseLine(this.lines[this.currLine], 4, [], recordDepth ? recordDepth + 1 : 1)
            result.push(recordResult);
            if(recordDepth === null) this.result.push(result);
        } else {
            if (step === DECLARATION_STRUCTURE.length) {
                if (scanner.peek() === -1) {
                    this.currLine++;
                    this.curCursor = 0;
                }
                else this.curCursor = scanner.cursor;
                if (recordDepth === null) {
                    this.result.push(result);
                    this.parseLine(this.lines[this.currLine]);
                }
            } else if (step < DECLARATION_STRUCTURE.length) {
                this.currLine++;
                this.curCursor = 0;
                this.parseLine(this.lines[this.currLine], step, result);
            }
        }
        return result;
    }

    isRecordEnd() {
        let lineIdx = this.currLine;
        let scanner2 = new Scanner(this.lines[lineIdx], this.curCursor);
        return scanner2.peek() === END;
    }

    parse() {
        try {
            while(this.currLine !== this.lines.length) {
                this.parseLine(this.lines[this.currLine]);
            }
            console.log(this.result);
        } catch (e) {
            console.log(e);
        }
    }
}

const parseClosure = (scanner, startStep = 0, prevResult=null, recordDepth=null) => {
   let step = startStep;
   let result = prevResult || [];
   let isRecord = false;

   function processStep(stage) {
       switch (stage) {
           case RESERVED_VAR:
           case COLON:
               if(scanner.peek() === stage) {
                   scanner.consume();
                   step++;
                   break;
               } else throw "error: invalid syntax";
           case IDENTIFIER:
               if(IDENTIFIER_REGEX.test(scanner.peek())) {
                    result.push(scanner.consume());
                    step++;
                    break;
               } else throw "error: invalid identifier";
           case TYPE:
               const type = scanner.peek();
               if(type === RESERVED_NUMBER || type === RESERVED_STRING) {
                   result.push(scanner.consume());
               } else if(type === RESERVED_RECORD) {
                   isRecord = true;
                   scanner.consume();
               } else throw "error: invalid syntax";
               step++;
               break;
           case END:
               if(recordDepth && scanner.peek() === END) {
                   scanner.consume();
               }
               if(scanner.peek() === SEMI) {
                   scanner.consume();
                   step++;
               } else throw "error: invalid syntax";
               break;
       }
   }
    function process() {
        for(let stage = step; stage < DECLARATION_STRUCTURE.length; stage++) {
            if(scanner.peek() === -1 || isRecord) {
                return {result, step, isRecord};
            }
            processStep(DECLARATION_STRUCTURE[stage]);
        }
        return {result, step, isRecord};
    }

    return {
        process,
    }
}

module.exports = {
    Parser: Parser
}