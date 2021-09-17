// similiar:
// https://github.com/anatoo/fnparse.js
// https://github.com/francisrstokes/arcsecond


export function stringIterator(string) {
    let pos = {line:0, column:0, position:0};

    return object({
        pointer:0,
        char:string[0],
        async next(){
            ++this.pointer;
            this.char = string[this.pointer];

            // ++pos.position;
            // ++pos.column;
            // if (this.char === "\n") { ++pos.line; pos.column = 0; }

            return this.char !== undefined;
        },
        async at(pointer){
            return string[pointer];
        },
        take(start, end) {
            return string.slice(start, end);
            /* // remove used part to save memory, only root consumers?
            let part = string.slice(start, end);
            string = string.substring(end);
            this.pointer = 0;
            return part;
            */
        },
        /*
        position(){
            return pos;
        }
        */
        //lookOut(offset) { return string[this.pointer+offset]; }, // char att offset relative to position
    });
}




var errorConsumer = fnConsumer(async strIter=>{
    await strIter.next();
}, 'no expected');


export async function tokenize(consumers, strIter, parent) { // startedAt needed?
    var tokens = [];
    let activeToken = null;

    consumers.push(errorConsumer)

    while (strIter.char !== undefined) {

        let oldPos = strIter.pointer; // check if moved

        for (let consumer of consumers) {
            let consumed = await consumer(strIter);
            if (consumed) {
                activeToken = token(strIter, {...consumed, parent, prev:activeToken});
                console.log(activeToken)
                tokens.push(activeToken);
                break;
            }
        }

        if (oldPos === strIter.pointer) {
            console.warn('strIter position not moved! zzz?');
            await strIter.next();
        }

    }
    return tokens;
}
function token(strIter, data){
    var obj = Object.create(null);
    Object.assign(obj, data);
    obj.text = strIter.take(obj.start, obj.end);
    return obj;
}



/* consumer generators */

export function charsConsumer(chars, name) {
    const set = new Set(chars);
    return fnConsumer(async strIter=>{
        while (set.has(strIter.char) &&  await strIter.next());
    }, name??chars);
}
export function fnConsumer(fn, name) {
    name ??= fn.name;
    return async strIter=>{
        let start = strIter.pointer;
        var data = await fn(strIter);
        if (start !== strIter.pointer) return Object.assign({name, start, end:strIter.pointer}, data);
    }
}
export function startEndConsumer(start, end, escape, name){
    name ??= start;
    var startLen = start.length;
    return fnConsumer(async function(strIter){
        if (! await matchStart(strIter, start)) return;
        for (let i=startLen; i>1; i--) await strIter.next();
        while (await strIter.next()){

            if (await strIter.at(strIter.pointer-1) === escape) continue; // only works as singel char end

            if (await matchEnd(strIter, end)) {
                await strIter.next(); // move to the next char
                return;
            }
        }
    }, name);
}


/* helpers */

export async function matchStart(strIter, str){
    var pos = 0;
    while (str[pos] === await strIter.at(strIter.pointer + pos)) {
        if (str[++pos] === undefined) return true;
    }
}
export async function matchEnd(strIter, str){
    let length = str.length-1;
    var pos = length;
    while (str[pos] === await strIter.at(strIter.pointer - (length-pos))) {
        if (--pos === -1) return true;
    }
}



export function object(obj){
    return Object.setPrototypeOf(obj,null);
}




/*
async function stringInterator(stream){
    const reader = stream.getReader();
    let result = '';
    let streamDone = false;

    async function read(){
        let state = await reader.read();
        streamDone = state.done;
        obj.string += state.value;
    }

    const obj = object({
        string: '',
        position: -1,
        async next(){
            ++this.pointer;
            if (this.string[this.pointer] === undefined) {
                if (!streamDone) await read();
                this.char = string[this.pointer];
            }
            return this.char !== undefined;
        },
        async at(position){
            while(1) {
                let char = this.string[position];
                if (char !== undefined) return char;
                if (streamDone) return false;
                await read();
            }
        }
    });
    return obj;
}
*/
