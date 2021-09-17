

let loadLibPromise = null;
function loadLib(){
    if (!loadLibPromise) {
        loadLibPromise = new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@gfortaine/qr-code-generator@1.0.6/qrcodegen.min.js';
            document.head.append(script);
            script.onload = () => resolve(qrcodegen);
            script.onerror = reject;
        });
    }
    return loadLibPromise;
}

customElements.define('u1-qrcode', class extends HTMLElement {

    constructor() {
        super();
        let shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
        <style>
        #container {
            display:contents;
        }
        #container > * {
            display:block;
        }
        svg { fill:currentColor; }
        </style>
        <div id=container></div>
        `;
        this._ready = loadLib();
    }

    connectedCallback() {
        this._redraw();
        /*
        this._ready.then(data=>{
            console.log(11)
            console.log(qrcodegen)
        })
        */
    }

    disconnectedCallback() {
    }

    async _redraw() {
        await this._ready;

        //return;

        const container = this.shadowRoot.getElementById('container');
        const QRC = qrcodegen.QrCode;
        const text = this.textContent; // todo: trim() ? can it be harmful?

        container.setAttribute('aria-lable', 'QR-Code: '+text);

        // Simple operation
        const qr0 = QRC.encodeText(text, QRC.Ecc.MEDIUM);
        container.innerHTML = toSvgString(qr0, 4);  // See qrcodegen-input-demo
    }


});

function toSvgString(qr, lightColor, darkColor) {
    const border = 0;
    let parts = [];
    for (let y = 0; y < qr.size; y++) {
        for (let x = 0; x < qr.size; x++) {
            if (qr.getModule(x, y))
                parts.push(`M${x + border},${y + border}h1v1h-1z`);
        }
    }
    //<svg xmlns="http://www.w3.org/2000/svg" xversion="1.1" viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}" stroke="none">
    return `
    <svg viewBox="0 0 ${qr.size + border * 2} ${qr.size + border * 2}">
        <!--rect width="100%" height="100%" xfill="transparent"/-->
        <path d="${parts.join(" ")}"/>
    </svg>
    `
}