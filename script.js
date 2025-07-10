document.addEventListener('DOMContentLoaded', () => {
    const openingText = document.getElementById('opening-text');
    const endingText = document.getElementById('ending-text');
    const browser = document.getElementById('browser');
    const urlEl = document.getElementById('url');
    const iframe = document.getElementById('app-iframe');
    const cursor = document.getElementById('cursor');
    const narrationBox = document.getElementById('narration-box');

    const svgCodeToPaste = `<svg height="100" width="100">
  <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
</svg>`;

    const optimizedSvgCode = `<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow"/></svg>`;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function showNarration(text, duration) {
        narrationBox.textContent = text;
        narrationBox.style.opacity = '1';
        await sleep(duration);
        narrationBox.style.opacity = '0';
    }

    async function typeIn(element, text, speed = 50) {
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await sleep(speed);
        }
    }

    async function moveCursor(x, y, duration = 1000) {
        cursor.style.transition = `all ${duration / 1000}s ease-in-out`;
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
        await sleep(duration);
    }

    function setCursorHighlight(highlight) {
        if (highlight) {
            cursor.classList.add('highlight');
        } else {
            cursor.classList.remove('highlight');
        }
    }
    
    // Create a mock version of the app inside the iframe for reliable animation
    const mockAppHTML = `
        <style>
            body { font-family: sans-serif; display: flex; height: 100vh; margin: 0; background-color: #1a1a1a; color: #eee; }
            .panel { flex: 1; padding: 20px; display: flex; flex-direction: column; }
            h2 { margin-top: 0; font-weight: normal; color: #888; }
            textarea { width: 100%; flex-grow: 1; background: #2a2a2a; border: 1px solid #444; color: #eee; font-family: monospace; font-size: 14px; resize: none; padding: 10px; }
            #preview-area { flex-grow: 1; display: flex; justify-content: center; align-items: center; background: #222; border-radius: 5px; margin-top: 10px; }
            #preview-svg { opacity: 0; transition: opacity 0.5s; }
            #output-code { opacity: 0; transition: opacity 0.5s; }
            button { background: #007acc; color: white; border: none; padding: 10px 15px; border-radius: 5px; font-size: 16px; cursor: pointer; margin-top: 10px; align-self: flex-start; }
            button:active { background: #005d9c; }
        </style>
        <div class="panel">
            <h2>Input SVG</h2>
            <textarea id="input-code"></textarea>
        </div>
        <div class="panel">
            <h2>Optimized SVG</h2>
            <textarea id="output-code" readonly></textarea>
            <button id="copy-btn">Copy optimized SVG</button>
            <h2>Preview</h2>
            <div id="preview-area">
                <div id="preview-svg"></div>
            </div>
        </div>
    `;

    async function runAnimation() {
        // 1. Opening (5s)
        await sleep(5000);

        // 2. Open Tool (5s)
        openingText.style.opacity = '0';
        browser.style.opacity = '1';
        cursor.style.opacity = '1';
        showNarration('今回は、SVGをかんたんに最適化できる無料ツールを使ってみましょう。', 4500);
        await moveCursor(100, 23, 500);
        await typeIn(urlEl, 'https://svg.vercel.app/', 80);
        await sleep(500);
        iframe.contentDocument.write(mockAppHTML);
        iframe.contentDocument.close();
        await sleep(1500);

        const inputCodeEl = iframe.contentDocument.getElementById('input-code');
        const outputCodeEl = iframe.contentDocument.getElementById('output-code');
        const previewSvgEl = iframe.contentDocument.getElementById('preview-svg');
        const copyBtn = iframe.contentDocument.getElementById('copy-btn');

        // 3. Input SVG Code (10s)
        showNarration('まずはこちらに、最適化したいSVGコードを貼り付けます。', 4000);
        await moveCursor(250, 250, 1000);
        setCursorHighlight(true);
        await sleep(500);
        inputCodeEl.value = svgCodeToPaste; 
        setCursorHighlight(false);
        await sleep(5500);

        // 4. Preview appears (8s)
        showNarration('貼り付けるとすぐに、画像プレビューが表示されます。', 4000);
        previewSvgEl.innerHTML = svgCodeToPaste;
        previewSvgEl.style.opacity = '1';
        await sleep(4000);

        // 5. Optimized code appears (10s)
        showNarration('右側には、最適化されたクリーンなSVGコードが自動で表示されます。', 5000);
        outputCodeEl.value = optimizedSvgCode;
        outputCodeEl.style.opacity = '1';
        await sleep(5000);

        // 6. Copy code (5s)
        showNarration('このボタンを押せば、最適化済みのコードをすぐコピーできます。', 4500);
        await moveCursor(690, 350, 1000);
        setCursorHighlight(true);
        await sleep(500);
        copyBtn.style.background = '#005d9c';
        await sleep(200);
        copyBtn.style.background = '#007acc';
        setCursorHighlight(false);
        await sleep(3000);

        // 7. Ending (5s)
        browser.style.opacity = '0';
        cursor.style.opacity = '0';
        endingText.classList.add('active');
        await sleep(5000);
        endingText.style.opacity = '0';
        
        // Loop animation
        await sleep(1000);
        window.location.reload();
    }

    runAnimation();
});
