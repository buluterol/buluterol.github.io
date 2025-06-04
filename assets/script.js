function getActiveInput() {
    return document.getElementById('user-input');
}
function getActiveInputLine() {
    return document.getElementById('input-line');
}
const body = document.body;

function typeEffect(element, text, callback) {
    let index = 0;
    const interval = setInterval(() => {
        element.textContent += text[index];
        index++;
        if (index === text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 20); // Harfler arasındaki gecikme (ms)
}

async function fetchResponses() {
    const response = await fetch('assets/responses.json');
    return response.json();
}

document.addEventListener('keydown', async function (e) {
    let userInput = getActiveInput();
    let inputLine = getActiveInputLine();

    // Enter tuşu için özel durum
    if (e.key === 'Enter') {
        const inputText = userInput.textContent.trim();
        const responses = await fetchResponses();

        if (responses[inputText]) {
            const response = responses[inputText];
            if (Array.isArray(response)) {
                for (const item of response) {
                    const line = document.createElement('div');
                    line.className = 'terminal-line';
                    body.appendChild(line);

                    if (typeof item === 'string') {
                        await new Promise(resolve => typeEffect(line, item, resolve));
                    } else if (item.url) {
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.target = '_blank';
                        link.textContent = item.text;
                        await new Promise(resolve => {
                            typeEffect(line, '', () => {
                                line.appendChild(link);
                                resolve();
                            });
                        });
                    }
                }
            }
        } else {
            // Access Denied mesajı ekle
            const deniedLine = document.createElement('div');
            deniedLine.className = 'terminal-line';
            body.appendChild(deniedLine);
            await new Promise(resolve => typeEffect(deniedLine, 'Access Denied', resolve));
        }

        // Yeni input satırı oluştur
        const newLine = document.createElement('div');
        newLine.className = 'terminal-line';
        newLine.setAttribute('id', 'input-line');
        newLine.innerHTML = '&gt; <span id="user-input"></span><span class="cursor"></span>';
        body.appendChild(newLine);

        // Eski input satırındaki cursor'u kaldır
        const oldCursor = inputLine.querySelector('.cursor');
        if (oldCursor) oldCursor.style.display = 'none';
        inputLine.removeAttribute('id');
        userInput.removeAttribute('id');

        // Scroll en alta
        window.scrollTo(0, document.body.scrollHeight);

        e.preventDefault();
        return;
    }

    // Handle printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        userInput.textContent += e.key;
    }
    // Handle Backspace
    if (e.key === 'Backspace') {
        userInput.textContent = userInput.textContent.slice(0, -1);
        e.preventDefault();
    }
});