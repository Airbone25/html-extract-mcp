
const form = document.querySelector('form');
const input = document.querySelector('#message');
const chat = document.querySelector('#chat');

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = input.value;
    if (!message) return;

    const userMessage = document.createElement('li');
    userMessage.classList.add('message', 'user');
    userMessage.innerHTML = `<strong>You:</strong> ${message}`;
    chat.appendChild(userMessage);
    userMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        const data = await res.json();
        input.value = '';
        const botMessage = document.createElement('li');
        botMessage.classList.add('message', 'bot');
        botMessage.innerHTML = `<strong>Bot:</strong> ${marked.parse(data.response)}`;
        chat.appendChild(botMessage);
        botMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        console.error('Error:', error);
    }

});