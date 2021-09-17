import {onElement} from '../../onElement/mod.js';

const sheets = new WeakSet();
const elements = new WeakSet();

async function foundElement(el, byDebug){
    if (elements.has(el)) return; // what if element order changes?
    //el.setAttribute('crossorigin','true');
    console.log('found new Element by '+byDebug, el);
    elements.add(el);
    const sheet = await elSheetReady(el);
    checkSheet(el.sheet);
}

/*
document.styleSheets has the right order of sheets, but imported sheets are not included
*/
for (let sheet of document.styleSheets) {
    if (!sheet.ownerNode) console.warn('are root-sheets without ownerNode possible?');
    foundElement(sheet.ownerNode, 'document.styleSheets');
}
/*
sometimes the load-event comes before mutationobserver? not really
- first big .css?
has to listen on document, window triggers on document-load
*/
document.addEventListener('load',({target})=>{
    if (!elements.has(target)) console.warn('load was first!!!');
    foundElement(target, 'load')
    // console.log('triggered load', target, e);
    // if (target.tagName !== 'LINK') return;
    // if (target.rel !== 'stylesheet') return;
    // foundElement(target)
},true);

onElement('link[rel="stylesheet"], style', {immediate: el=>{
    // checks all styleSheets and importRules, todo store urls global and check all if used url found
    // console.log(el.sheet)
    foundElement(el, 'onElement');
    //checkAllSheets()
}});

function checkAllSheets(){
    for (let sheet of document.styleSheets) checkSheet(sheet);
}
function checkSheet(sheet){
    if (sheets.has(sheet)) console.error('sheet already added!?');
    sheets.add(sheet);
    try { // firefox fails sometimes if we access sheet.cssRules immediate after found it, really?
        checkImportRules(sheet.cssRules);
    } catch (e) {
        console.log('fail',sheet, e) //
    }
}
function checkImportRules(rules){
    for (let rule of rules) {
        console.log(rule)
        if (rule instanceof CSSImportRule) checkSheet(rule.styleSheet);
        else break;
    }
}


/*
const urls = {};
function checkAllSheets(){
    for (let sheet of document.styleSheets) checkSheet(sheet);
}
function checkSheet(sheet){
    console.log('sheet',sheet)
    try { // firefox fails sometimes if we access sheet.cssRules immediate after found it
        checkImportRules(sheet.cssRules);
    } catch (e) {
        //console.log('fail',sheet, e) //
    }
    if (!sheet.href) return;
    console.log(urls)
    if (medialistHas(sheet.media, 'once')) {
        sheet.disabled = !!urls[sheet.href];
        urls[sheet.href] = 1;
    }

}
function checkImportRules(rules){
    for (let rule of rules) {
        if (rule instanceof CSSImportRule) checkSheet(rule.styleSheet);
    }
}
function medialistHas(mediaList, wanted){
    for (let medium of mediaList) if (medium === wanted) return true;
}
*/

/* utils */

function elSheetReady(el){
    return new Promise(function(resolve, reject){
        if (el.sheet) resolve(el.sheet);
        el.addEventListener('load',()=>{
            if (el.sheet) resolve(el.sheet);
            else reject('no sheet!');
        },{once:true})
        setTimeout(()=>reject('timeout'),2000)
    })
}