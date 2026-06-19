const API = window.location.origin;

// --------------------
// SAVE CHAT
// --------------------

function saveChat() {
    localStorage.setItem(
        "travelChat",
        document.getElementById("chatBox").innerHTML
    );
}

// --------------------
// LOAD CHAT
// --------------------

function loadSavedChat() {

    const savedChat = localStorage.getItem("travelChat");

    if (savedChat) {
        document.getElementById("chatBox").innerHTML = savedChat;
        return true;
    }

    return false;
}

// --------------------
// SEND MESSAGE
// --------------------

async function sendMessage() {

    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");

    const text = input.value.trim();

    if (!text) return;

    chatBox.insertAdjacentHTML(
        "beforeend",
        `
        <div class="user-message">
            <div>${text}</div>
        </div>
        `
    );

    saveChat();

    input.value = "";

    try {

        const response = await fetch(`${API_URL}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text
            })
        });

        const data = await response.json();

        chatBox.insertAdjacentHTML(
            "beforeend",
            `
            <div class="bot-message">
                <div>
                    <strong>✈ Travel AI</strong>
                    <br><br>
                    ${data.response.replace(/\n/g, "<br>")}
                </div>
            </div>
            `
        );

        saveChat();

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {

        console.error(error);

        chatBox.insertAdjacentHTML(
            "beforeend",
            `
            <div class="bot-message">
                <div>
                    ❌ Failed to connect to server
                </div>
            </div>
            `
        );

        saveChat();
    }
}

// --------------------
// HISTORY
// --------------------

async function loadHistory() {

    const chatBox = document.getElementById("chatBox");

    try {

        const response = await fetch(`${API_URL}/history`);
        const data = await response.json();

        chatBox.innerHTML = `
        <div class="bot-message">
            <div>
                <h2>📜 Travel History</h2>
            </div>
        </div>
        `;

        data.history.forEach(item => {

            chatBox.insertAdjacentHTML(
                "beforeend",
                `
                <div class="user-message">
                    <div>${item[1]}</div>
                </div>

                <div class="bot-message">
                    <div>${item[2]}</div>
                </div>
                `
            );
        });

        saveChat();

    } catch (error) {

        console.error(error);
    }
}

// --------------------
// CLEAR HISTORY
// --------------------

async function clearHistory() {

    try {

        await fetch(`${API_URL}/clear`, {
            method: "DELETE"
        });

        localStorage.removeItem("travelChat");

        newChat();

    } catch (error) {

        console.error(error);
    }
}

// --------------------
// DESTINATIONS
// --------------------

async function showDestinations() {

    const chatBox = document.getElementById("chatBox");

    try {

        const response = await fetch(`${API_URL}/destinations`);
        const data = await response.json();

        chatBox.innerHTML = `
        <div class="bot-message">
            <div>
                <h2>🌍 Popular Destinations</h2>
            </div>
        </div>
        `;

        data.destinations.forEach(place => {

            chatBox.insertAdjacentHTML(
                "beforeend",
                `
                <div class="bot-message">
                    <div>
                        <h3>${place.name}</h3>
                        <p>${place.description}</p>
                        <br>
                        <b>Best Time:</b> ${place.best_time}
                        <br>
                        <b>Budget:</b> ${place.budget}
                    </div>
                </div>
                `
            );
        });

        saveChat();

    } catch (error) {

        console.error(error);
    }
}

// --------------------
// TIPS
// --------------------

function showTips() {

    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML = `
    <div class="bot-message">
        <div>

            <h2>💡 Travel Tips</h2>

            <br>

            🌄 <b>Munnar</b><br>
            • Carry warm clothes<br>
            • Visit Top Station early<br>

            <br>

            🏖 <b>Goa</b><br>
            • Use sunscreen<br>
            • Carry light clothes<br>

            <br>

            🌿 <b>Wayanad</b><br>
            • Carry trekking shoes<br>

            <br>

            ❄ <b>Kashmir</b><br>
            • Carry winter clothes<br>

        </div>
    </div>
    `;

    saveChat();
}

// --------------------
// QUICK BUTTONS
// --------------------

function quickPrompt(text) {

    document.getElementById("userInput").value = text;
    sendMessage();
}

// --------------------
// NEW CHAT
// --------------------

function newChat() {

    const chatBox = document.getElementById("chatBox");

    chatBox.innerHTML = `
    <div class="bot-message">
        <div>

            👋 Welcome to AI Travel Planner

            <br><br>

            Try asking:

            <br><br>

            • 3 day trip to Munnar
            <br>
            • Budget Goa Trip
            <br>
            • Wayanad itinerary
            <br>
            • Kashmir itinerary

        </div>
    </div>
    `;

    saveChat();
}

// --------------------
// PAGE LOAD
// --------------------

document.addEventListener("DOMContentLoaded", () => {

    const loaded = loadSavedChat();

    if (!loaded) {
        newChat();
    }

    const input = document.getElementById("userInput");

    input.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();
            sendMessage();
        }
    });
});