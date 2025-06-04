function getActiveInput() {
    return document.getElementById('user-input');
}
function getActiveInputLine() {
    return document.getElementById('input-line');
}
const body = document.body;

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
                response.forEach(item => {
                    const line = document.createElement('div');
                    line.className = 'terminal-line';
                    if (typeof item === 'string') {
                        line.textContent = item;
                    } else if (item.url) {
                        line.innerHTML = `&nbsp;&nbsp;&nbsp;&nbsp;<a href="${item.url}" target="_blank">${item.text}</a>`;
                    }
                    body.appendChild(line);
                });
            }
        } else {
            // Access Denied mesajı ekle
            const deniedLine = document.createElement('div');
            deniedLine.className = 'terminal-line';
            deniedLine.textContent = 'Access Denied';
            body.appendChild(deniedLine);
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