const HASH = '#';
const COLON = ':';
const SEMI = ';';
const EMPTY = '';
class Scanner {
    constructor(line,cursor=null) {
        this.line = this.preprocess(line.trim().split(" "));
        this.cursor = cursor ? cursor : 0;
    }

    preprocess(line) {
        let words = [];
        let skip = false;
        const splitWord = (word, char) => {
            const splitWord = word.split(char);
            wordProcessor(splitWord[0]);
            wordProcessor(char);
            if(splitWord.length === 2) wordProcessor(splitWord[1]);
        }
        const wordProcessor = (word) => {
            if(skip) return;
            switch (word) {
                case EMPTY: break;
                case COLON:
                case SEMI:
                    words.push(word);
                    break;
                case HASH:
                    skip = true;
                    break;
                default: {
                    if(word.indexOf(COLON) > -1) {
                        splitWord(word, COLON);
                    } else if(word.indexOf(SEMI) > -1) {
                        splitWord(word, SEMI);
                    } else if(word.indexOf(HASH) > -1) {
                        splitWord(word, HASH);
                    } else {
                        words.push(word);
                    }
                }
            }
        }
        line.forEach(word => {
            wordProcessor(word);
        });
        return words;
    }

    peek() {
        if(this.cursor === this.line.length) return -1;
        return this.line[this.cursor];
    }

    consume() {
        return this.line[this.cursor++];
    }
}

module.exports = {
    Scanner: Scanner,
    COLON: COLON,
    SEMI: SEMI
}