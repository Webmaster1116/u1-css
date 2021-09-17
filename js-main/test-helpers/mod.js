/**
 * @description create a big test-dom structure
 * @returns HTMLElement, the created root
 * @ussage
 * var root = createBigDom({ depth=40, num=5000, maxChildren=100,
 *   createElement:()=>{
 *     var el = document.createElement('article');
 *     el.innerHTML = 'test';
 *     return el;
 *   }
 * });
 */
export function createBigDom({ createElement, root, depth = 40, num = 5000, maxChildren = 100 } = {}) {
    // https://web.dev/dom-size/#how-the-lighthouse-dom-size-audit-fails
    if (!root) {
        var root = document.createElement('div');
        document.body.append(root);
    }
    root.className = 'bigDom';
    let aDepth = 0;
    let aNum = 0;
    function addChildren(parent) {
        aDepth++;
        for (let i = 0; i < maxChildren; i++) {
            if (aNum >= num) break;
            const el = createElement ? createElement() : document.createElement('span');
            parent.append(el);
            aNum++;
            if (aNum >= num) return;
            if (aDepth < depth) addChildren(el);
        }
        aDepth--;
    }
    addChildren(root);
    return root;
}
