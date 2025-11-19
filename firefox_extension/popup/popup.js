const states = {
    loading: document.getElementById('loading'),
    results: document.getElementById('results'),
    error: document.getElementById('error'),
    instructions: document.getElementById('instructions')
};

function showState(state) {
    console.log("--- HanziFlow: popup.js changing state to:", state);
    Object.values(states).forEach(s => s.classList.add('hidden'));
    states[state].classList.remove('hidden');
}

// Get selected text from the active tab
async function getSelectedTextFromPage() {
    console.log("--- HanziFlow: popup.js asking content.js for text...");
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getSelectedText" }, (response) => {
                    console.log("--- HanziFlow: popup.js received response:", response);
                    resolve(response?.text || '');
                });
            } else {
                console.error("--- HanziFlow: popup.js: No active tab found!");
                resolve('');
            }
        });
    });
}

// Send text to background for processing
async function segmentChineseText(text) {
    console.log("--- HanziFlow: popup.js telling background.js to send API request...");
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({
            action: "segmentChinese",
            text: text
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("--- HanziFlow: popup.js: Error from background:", chrome.runtime.lastError.message);
                resolve({ success: false, error: chrome.runtime.lastError.message });
            } else if (response && response.success) {
                console.log("--- HanziFlow: popup.js: Got API data from background.js");
                resolve({ success: true, data: response.data });
            } else {
                console.error("--- HanziFlow: popup.js: Got failure from background.js:", response?.error);
                resolve({ success: false, error: response?.error || 'Unknown error' });
            }
        });
    });
}

// ... (displayResults and showError functions are unchanged) ...
function displayResults(originalText, segmentedData) {
    // 1. Set Original Text
    document.getElementById('originalText').textContent = originalText;

    // 2. Set Segmented Sentence
    // We check if the element exists before setting it
    const segmentedSentenceEl = document.getElementById('segmentedSentence');
    if (segmentedSentenceEl) {
        segmentedSentenceEl.textContent = segmentedData.segments;
    }

    // 3. Display Word List
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // Clear list
    segmentedData.words.forEach(item => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';

        wordElement.innerHTML = `
            <div class="word-chinese">${item.word}</div>
            <div class="word-translation">${item.translation}</div>
        `;

        wordList.appendChild(wordElement);
    });

    // 4. Display Usage Patterns
    const usageList = document.getElementById('usagePatternList');
    usageList.innerHTML = ''; // Clear list
    
    if (segmentedData.usage_patterns && segmentedData.usage_patterns.length > 0) {
        segmentedData.usage_patterns.forEach(pattern => {
            const patternElement = document.createElement('div');
            patternElement.className = 'usage-pattern';

            patternElement.innerHTML = `
                <div class="usage-phrase">${pattern.phrase}</div>
                <div class="usage-explanation">${pattern.explanation}</div>
                <div class="usage-example">${pattern.example}</div>
            `;
            usageList.appendChild(patternElement);
        });
        // Show the whole usage patterns section
        document.getElementById('usagePatterns').classList.remove('hidden');
    } else {
        // Hide the usage patterns section if none are found
        document.getElementById('usagePatterns').classList.add('hidden');
    }
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showState('error');
}


// Main initialization - runs when popup opens
async function initializePopup() {
    try {
        console.log("--- HanziFlow: popup.js: Initializing Popup ---");
        // Get selected text from current page
        const selectedText = await getSelectedTextFromPage();
        console.log("--- HanziFlow: popup.js: Text received:", `"${selectedText}"`);

        if (!selectedText) {
            console.log("--- HanziFlow: popup.js: No text found. Showing instructions.");
            showState('instructions');
            return;
        }

        // Show loading state
        showState('loading');

        // Call background script to segment the text
        const response = await segmentChineseText(selectedText);

        if (!response.success) {
            console.error("--- HanziFlow: popup.js: Segmentation failed:", response.error);
            throw new Error(response.error || 'Segmentation service unavailable');
        }

        // Display results
        console.log("--- HanziFlow: popup.js: Displaying results.");
        displayResults(selectedText, response.data);
        showState('results');

    } catch (error) {
        console.error('--- HanziFlow: popup.js: CATCH BLOCK ERROR ---', error);
        showError(error.message || 'Failed to process Chinese text');
    }
}

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initializePopup);