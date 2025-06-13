function getActiveInput() {
    return document.getElementById('user-input');
}
function getActiveInputLine() {
    return document.getElementById('input-line');
}
const body = document.body;

let autoScrollEnabled = true;

// Scroll durumunu kontrol eden işlev
function handleScroll() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
    autoScrollEnabled = atBottom;
}

// Yazı yazılırken otomatik scroll işlevi
function scrollToBottom() {
    if (autoScrollEnabled) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
}

// Scroll olayını dinle
window.addEventListener('scroll', handleScroll);

function typeEffect(element, text, callback) {
    if (!text || typeof text !== 'string') {
        // Eğer text düz yazı değilse, callback'i çağır ve işlemi sonlandır
        if (callback) callback();
        return;
    }
    document.querySelectorAll('.cursor').forEach(cursor => cursor.style.display = 'none');
    let index = 0;
    const interval = setInterval(() => {
        element.textContent += text[index];
        index++;
        scrollToBottom(); // Her harf yazıldığında scroll kontrolü
        if (index === text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 20); // Harfler arasındaki gecikme (ms)
}

async function fetchResponses() {
    const response = await fetch('assets/responses.json');
    return response.json();
    // return responseJson; // Örnek olarak, doğrudan JSON verisini kullanıyoruz
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
                        // Düz yazı için typeEffect
                        await new Promise(resolve => typeEffect(line, item, resolve));
                    } else if (typeof item === 'object' && item.url) {
                        // Link için doğrudan işleme
                        const link = document.createElement('a');
                        link.href = item.url;
                        link.target = '_blank';
                        link.textContent = item.text;
                        line.appendChild(link);
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

        scrollToBottom(); // Yeni satır eklendiğinde scroll kontrolü
        e.preventDefault();
        return;
    }

    // Handle printable characters
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        userInput.textContent += e.key;
        scrollToBottom(); // Yazı yazılırken scroll kontrolü
    }
    // Handle Backspace
    if (e.key === 'Backspace') {
        userInput.textContent = userInput.textContent.slice(0, -1);
        e.preventDefault();
    }
});