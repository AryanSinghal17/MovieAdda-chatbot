document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatWrapper = document.getElementById('chatbot-pop-wrapper');
    const textarea = document.querySelector('.message-input');
    const chatForm = document.querySelector('.chat-form');
    const chatBody = document.querySelector('.chat-body');
    const typingIndicator = document.querySelector('.typing-indicator');

    const toggleChatbot = () => {
        const isHidden = chatWrapper.classList.contains('hidden');
        if (isHidden) {
            chatWrapper.classList.remove('hidden');
            toggleBtn.querySelector('.material-symbols-rounded').textContent = 'close';
            toggleBtn.classList.add('active');
        } else {
            chatWrapper.classList.add('hidden');
            toggleBtn.querySelector('.material-symbols-rounded').textContent = 'mode_comment';
            toggleBtn.classList.remove('active');
        }
    };

    toggleBtn.addEventListener('click', toggleChatbot);

    const apiKey = "AIzaSyACBJ1VTmh3XjIK0XFgRTBIE_OTfaE6BN0";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const SYSTEM_INSTRUCTION = "";

    const adjustTextareaHeight = () => {
        textarea.style.height = '40px';
        textarea.style.height = `${textarea.scrollHeight}px`;
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    textarea.addEventListener('input', adjustTextareaHeight);
    adjustTextareaHeight();
    typingIndicator.style.display = 'none';

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageText = textarea.value.trim();
        if (messageText === '') return;

        const userMessageHtml = `
            <div class="message user-message">
                <div class="message-text">${messageText}</div>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', userMessageHtml);

        textarea.value = '';
        adjustTextareaHeight();
        chatBody.scrollTop = chatBody.scrollHeight;

        getBotResponse(messageText);
    });

    async function getBotResponse(userQuery) {
        typingIndicator.style.display = 'flex';
        chatBody.scrollTop = chatBody.scrollHeight;

        const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            tools: [{ "google_search": {} }],
        };

        const maxRetries = 3;
        let delay = 1000;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`API response status: ${response.status}`);

                const result = await response.json();
                const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
                displayBotMessage(generatedText);
                return;

            } catch (error) {
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2;
                } else {
                    displayBotMessage("I'm sorry, the service is currently unavailable. Please try again later.");
                }
            } finally {
                typingIndicator.style.display = 'none';
                chatBody.scrollTop = chatBody.scrollHeight;
            }
        }
    }

    function displayBotMessage(text) {
        const botMessageHtml = `
            <div class="message bot-message">
                ${getBotSvg()}
                <div class="message-text">${text}</div>
            </div>
        `;
        chatBody.insertAdjacentHTML('beforeend', botMessageHtml);
        chatBody.scrollTop = chatBody.scrollHeight;
    }
    function getBotSvg() {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="25" height="25">
                        <path d="M168.024 118.478V132.839C168.024 170.092 137.78 200.336 100.527 200.336C63.275 200.336 33.03 170.092 33.03 132.839V118.478H168.024Z" fill="rgb(255,211,174)" />
                        <path d="M168.024 118.478V71.087C168.024 33.835 137.78 3.59 100.527 3.59C63.275 3.59 33.03 33.835 33.03 71.087V118.478H168.024Z" fill="rgb(154,165,178)" />
                        <rect x="33.03" y="65.876" width="134.994" height="6.587" fill="rgb(51,51,51)" />
                        <path d="M33.676 92.2H167.378C171.052 92.2 174.034 95.182 174.034 98.856V118.823C174.034 122.497 171.052 125.479 167.378 125.479H33.676C30.003 125.479 27.02 122.497 27.02 118.823V98.856C27.02 95.182 30.003 92.2 33.676 92.2Z" fill="#9aa5b2" />
                    </svg>
        `;
    }
});