// content.js - Your existing content script (make sure it's named content.js)
function extractLeetCodeQuestion() {
    try {
        // More robust selectors for LeetCode problem description
        const problemSelectors = [
            '.elfjS', // Your original selector
            '[data-track-load="description_content"]',
            '.question-content',
            '.content__u3I1',
            '.question-content__JfgR'
        ];
        
        // More robust selectors for code solution
        const codeSelectors = [
            '.view-lines.monaco-mouse-cursor-text', // Your original selector
            '.monaco-editor .view-lines',
            '.CodeMirror-code',
            'pre code',
            '.ace_content'
        ];

        let problemContainer = null;
        let solutionContainer = null;

        // Find problem container using multiple selectors
        for (const selector of problemSelectors) {
            problemContainer = document.querySelector(selector);
            if (problemContainer) {
                console.log(`Found problem container with selector: ${selector}`);
                break;
            }
        }

        // Find solution container using multiple selectors
        for (const selector of codeSelectors) {
            solutionContainer = document.querySelector(selector);
            if (solutionContainer) {
                console.log(`Found solution container with selector: ${selector}`);
                break;
            }
        }

        if (!problemContainer) {
            console.log("Problem container not found. Available selectors:", 
                problemSelectors.map(s => `${s}: ${document.querySelector(s) ? 'found' : 'not found'}`));
            return;
        }

        // Extract problem description
        const problemElements = problemContainer.querySelectorAll('p, pre, div, h1, h2, h3, li');
        const problemDescription = Array.from(problemElements)
            .map(elem => {
                // Skip empty elements and code elements that might be examples
                if (!elem.textContent.trim() || elem.querySelector('code')) {
                    return elem.textContent.trim();
                }
                return elem.textContent.trim();
            })
            .filter(text => text.length > 0 && text.length < 1000) // Filter out very long text blocks
            .join('\n\n');

        // Extract solution code (if available)
        let solutionCode = '';
        if (solutionContainer) {
            // Try different approaches to get the code
            const codeElements = solutionContainer.querySelectorAll('span, div');
            
            if (codeElements.length > 0) {
                solutionCode = Array.from(codeElements)
                    .map(elem => elem.textContent || elem.innerText || '')
                    .join('');
            } else {
                // Fallback: get all text from the container
                solutionCode = solutionContainer.textContent || solutionContainer.innerText || '';
            }
            
            // Clean up the code
            solutionCode = solutionCode.trim();
        } else {
            console.log("Solution container not found - this is normal if user hasn't written code yet");
        }

        // Validate extracted content
        if (problemDescription.length < 10) {
            console.log("Problem description too short, might not have extracted correctly");
            console.log("Extracted:", problemDescription.substring(0, 100) + "...");
            return;
        }

        console.log("Extracted problem description:", problemDescription.substring(0, 200) + "...");
        console.log("Extracted solution length:", solutionCode.length);

        // Send to background script
        chrome.runtime.sendMessage({
            action: "sendProblem",
            data: {
                description: problemDescription,
                solution: solutionCode,
                url: window.location.href,
                timestamp: new Date().toISOString()
            }
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Error sending message:", chrome.runtime.lastError);
            } else {
                console.log("Problem saved:", response);
            }
        });

    } catch (error) {
        console.error("Error extracting LeetCode question:", error);
    }
}

// Function to wait for elements to load
function waitForElement(selectors, timeout = 10000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        function check() {
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
            }
            
            if (Date.now() - startTime < timeout) {
                setTimeout(check, 500);
            } else {
                resolve(null);
            }
        }
        
        check();
    });
}

// Main execution
async function init() {
    // Check if we're on a LeetCode problem page
    if (!window.location.href.includes('leetcode.com/problems/')) {
        console.log("Not on a LeetCode problem page");
        return;
    }

    console.log("LeetCode problem page detected, waiting for content to load...");
    
    // Wait for problem content to load
    const problemSelectors = ['.elfjS', '[data-track-load="description_content"]', '.question-content'];
    await waitForElement(problemSelectors);
    
    // Wait a bit more for dynamic content
    setTimeout(extractLeetCodeQuestion, 1000);
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Also run when navigation changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        setTimeout(init, 1000); // Wait for new page to load
    }
}).observe(document, { subtree: true, childList: true });

// Make function globally available for manual triggering
window.extractLeetCodeQuestion = extractLeetCodeQuestion;