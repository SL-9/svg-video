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
            :root {
                --grey-100: #1a1a1a;
                --grey-80: #333;
                --grey-70: #4f4f4f;
                --grey-50: #888;
                --grey-20: #ccc;
                --blue: #29b6f6;
            }
            body { 
                font-family: 'Inter', sans-serif;
                display: flex; 
                flex-direction: column;
                height: 100vh; 
                margin: 0; 
                background-color: var(--grey-100);
                color: var(--grey-20);
                overflow: hidden;
            }
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: var(--grey-80);
                padding: 0 20px;
                height: 50px;
                flex-shrink: 0;
            }
            header h1 { 
                font-size: 20px; 
                font-weight: 500;
                color: var(--blue);
            }
            main {
                display: grid;
                grid-template-columns: 1fr 1fr; /* 2 columns */
                grid-template-rows: 1fr auto; /* 2 rows, second row auto height */
                gap: 1px;
                background-color: var(--grey-70);
                flex-grow: 1;
                height: calc(100% - 50px);
            }
            .code-wrapper {
                background: var(--grey-100);
                padding: 15px;
                display: flex;
                flex-direction: column;
                position: relative;
            }
            .code-wrapper h2 {
                margin: 0 0 10px 0;
                font-weight: 500;
                color: var(--grey-50);
                font-size: 14px;
                text-transform: uppercase;
            }
            textarea {
                flex-grow: 1;
                background: var(--grey-100);
                border: 1px solid var(--grey-80);
                color: var(--grey-20);
                font-family: 'Roboto Mono', monospace;
                font-size: 14px;
                resize: none;
                padding: 10px;
                border-radius: 4px;
            }
            #copy-btn {
                background: var(--blue);
                color: black;
                border: none;
                padding: 5px 15px;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color .2s;
                margin-top: 10px; /* Add some space above */
                align-self: flex-start; /* Align to the left */
            }
            #copy-btn:hover { background: #81d4fa; }
            .output-wrapper {
                grid-column: span 2; /* Span across both columns */
                background: var(--grey-100);
                padding: 15px;
                display: flex;
                flex-direction: column;
                position: relative; /* For positioning the copy button */
            }
            #preview-area {
                background: var(--grey-100);
                padding: 15px;
                display: flex;
                flex-direction: column;
            }
             #preview-area h2 {
                margin: 0 0 10px 0;
                font-weight: 500;
                color: var(--grey-50);
                font-size: 14px;
                text-transform: uppercase;
            }
            #preview-svg-container {
                flex-grow: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                background-image: linear-gradient(45deg, var(--grey-80) 25%, transparent 25%), linear-gradient(-45deg, var(--grey-80) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--grey-80) 75%), linear-gradient(-45deg, transparent 75%, var(--grey-80) 75%);
                background-size: 20px 20px;
                background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                border-radius: 4px;
            }
            #preview-svg { opacity: 0; transition: opacity 0.5s; }
            #output-code { opacity: 0; transition: opacity 0.5s; }

            @media (max-width: 768px) {
                main {
                    grid-template-columns: 1fr; /* Switch to a single column */
                    grid-template-rows: auto auto auto; /* Each item gets its own row */
                    overflow-y: auto; /* Allow scrolling on small screens */
                    height: calc(100% - 45px); /* Adjust height for smaller header */
                }
                .code-wrapper, #preview-area, .output-wrapper {
                    padding: 12px;
                }
                 header {
                    height: 45px;
                    padding: 0 15px;
                }
                header h1 {
                    font-size: 18px;
                }
                textarea {
                    min-height: 200px; /* Ensure textarea is tall enough */
                    font-size: 13px;
                }
                .output-wrapper {
                    grid-column: 1; /* Unset span */
                }
                #copy-btn {
                    padding: 8px 16px; /* Make button easier to tap */
                    font-size: 15px;
                }
            }
        </style>
        <header>
            <h1>SVGOMG</h1>
        </header>
        <main>
            <!-- Row 1, Column 1 -->
            <div class="code-wrapper">
                <h2>Input SVG</h2>
                <textarea id="input-code"></textarea>
            </div>

            <!-- Row 1, Column 2 -->
            <div id="preview-area">
                <h2>Preview</h2>
                <div id="preview-svg-container">
                    <div id="preview-svg"></div>
                </div>
            </div>

            <!-- Row 2, Spanning 2 Columns -->
            <div class="output-wrapper">
                <h2>Optimized SVG</h2>
                <textarea id="output-code" readonly></textarea>
                <button id="copy-btn">Copy</button>
            </div>
        </main>
    `;

    async function runAnimation() {
        // 1. Opening (was 5s, now 7s)
        await sleep(7000);

        // 2. Open Tool (5s)
        openingText.style.opacity = '0';
        browser.style.opacity = '1';
        cursor.style.opacity = '1';
        showNarration('今回は、SVGをかんたんに最適化できる無料ツールを使ってみましょう。', 5000);
        await moveCursor(100, 23, 500);
        await typeIn(urlEl, 'https://svg.vercel.app/', 80);
        await sleep(500);
        iframe.contentDocument.write(mockAppHTML);
        iframe.contentDocument.close();
        await sleep(2500); // Increased pause

        const inputCodeEl = iframe.contentDocument.getElementById('input-code');
        const outputCodeEl = iframe.contentDocument.getElementById('output-code');
        const previewSvgEl = iframe.contentDocument.getElementById('preview-svg');
        const copyBtn = iframe.contentDocument.getElementById('copy-btn');

        // 3. Input SVG Code (was 10s, now 12s)
        showNarration('まずはこちらに、最適化したいSVGコードを貼り付けます。', 5000);
        await moveCursor(320, 280, 1000); // Adjusted coordinates
        setCursorHighlight(true);
        await sleep(500);
        inputCodeEl.focus();
        inputCodeEl.value = svgCodeToPaste; 
        setCursorHighlight(false);
        await sleep(6500); // Increased pause

        // 4. Preview appears (was 8s, now 10s)
        showNarration('貼り付けるとすぐに、画像プレビューが表示されます。', 5000);
        previewSvgEl.innerHTML = svgCodeToPaste;
        previewSvgEl.style.opacity = '1';
        await sleep(5000); // Increased pause

        // 5. Optimized code appears (was 10s, now 12s)
        showNarration('下側には、最適化されたクリーンなSVGコードが自動で表示されます。', 6000);
        outputCodeEl.value = optimizedSvgCode;
        outputCodeEl.style.opacity = '1';
        await sleep(6000); // Increased pause

        // 6. Copy code (was 5s, now 7s)
        showNarration('このボタンを押せば、最適化済みのコードをすぐコピーできます。', 5000);

        // Scroll down to the button if needed on smaller screens
        const mainEl = iframe.contentDocument.querySelector('main');
        if (mainEl.scrollHeight > mainEl.clientHeight) {
            mainEl.scrollTo({
                top: mainEl.scrollHeight,
                behavior: 'smooth'
            });
            await sleep(1000); // Wait for scroll animation
        }

        await moveCursor(45, 645, 1000); // Re-adjusted coordinates for button center
        setCursorHighlight(true);
        await sleep(500);
        // Simulate click effect
        copyBtn.style.backgroundColor = '#81d4fa';
        await sleep(200);
        copyBtn.style.backgroundColor = 'var(--blue)';
        setCursorHighlight(false);
        await sleep(4000); // Increased pause

        // 7. Ending (was 5s, now 7s)
        browser.style.opacity = '0';
        cursor.style.opacity = '0';
        endingText.classList.add('active');
        await sleep(7000);
        endingText.style.opacity = '0';
        
        // Animation finished
    }

    runAnimation();
});
