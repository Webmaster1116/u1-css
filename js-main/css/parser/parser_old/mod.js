import { stringGenerator } from "./util.js";



const tokens = {
    anyChar: {
        match:(char)=>{
            return true
        }
    },
    whiteSpace(strGen){
        return strGen.cha === ' ' || strGen.cha === "\n" || strGen.cha === "\t";
    },
}


export function parse(str) {
    const strGen = stringGenerator(str);
    walkParser(stylesheet, strGen)
}

function walkParser(parser, strGen){

    let startOuter = strGen.position;
    let endOuter = null;

    if (parser.start) startOuter -= parser.start.length;

    let char = strGen.current();
    do {
        if (parser.end && parser.end.match(char)) {
            endOuter = strGen.position + 1;
            break; // reached end
        }
        if (parser.contains) for (let subParser of parser.contains) {
            if (subParser.start.match(char)) {
                // todo: reset all subparser starts?
                strGen.next()
                walkParser(subParser, strGen); // continue in subParser if start matches
            }
        }
    } while(char = strGen.next());

    endOuter ??= strGen.position;

    var outer = strGen.string.slice(startOuter, endOuter);
    console.log('----' + parser.name + ': ---- ');
    console.dir('`'+outer+'`');
}


const comment   = parser('comment',  '/*', [], '*/');
const slComment = parser('comment',  '//', [], "\n");

/*
const comment = {
    name:'comment'
    start:'/*',
    end:'* /',
};
const slComment = {
    name:'slComment'
    start:'//',
    endBefore:"\n",
}
const dqString = {
    name:'string double-quote'
    start:'"',
    end:'"',
}
*/



const stringDEscape  = parser('string dq escape',  '\\', [],'"');
const stringSEscape  = parser('string sq escape',  '\\', [],"'");
//const stringD        = parser('string dq',  '"', [stringDEscape],'"');

const stringD        = parser('string dq',  '"', ['\\"'],'"');
const stringS        = parser('string sq',  "'", [stringSEscape],"'");

const stylesheet  = parser('stylesheet',  '', [comment,slComment] );

/*
const comment  = parser('comment',  '/*', [], '* /');

const stringDEscape  = parser('string dq escape',  '\\', [],'"');
const stringSEscape  = parser('string sq escape',  '\\', [],"'");
const stringD        = parser('string dq',  '"', [stringDEscape],'"');
const stringS        = parser('string sq',  "'", [stringSEscape],"'");

const block       = parser('block',       '{',  [stringS],'}');
const selector    = parser('selector',    '.',  [comment], '{');
const declaration = parser('declaration', '',   [block,stringS,stringD],';');
const rule        = parser('rule',        '',   [selector, declaration, comment], '}');
const atStatement = parser('at-statment', '@',  [stringD, stringS], ';');
const atBlock     = parser('at-block',    '@',  [stringS, block],'}');
const stylesheet  = parser('stylesheet',  '',   [comment, atStatement, atBlock, rule], '}');
*/




/*
stylesheetRule = {
    contains:[whiteSpace,atRule,rule],
}
*/
function parser(name, start, contains, end){
    if (!contains) contains = [];
    if (!Array.isArray(contains)) contains = [contains];
    return {
        name,
        contains,
        start: toToken(start),
        end: end&&toToken(end),
    }
}


function toToken(token){
    if (token === '') return tokens.anyChar;
    return stringGenerator(token);
    if (typeof token === 'string' && token.lenght > 1) {
        return stringGenerator(token);
    }
    if (token.match) return token;
}
