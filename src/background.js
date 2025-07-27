// background.js - Create this file in your extension folder
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "sendProblem") {
        console.log("Received problem from content script:", message.data);
        
        // Store the data
        chrome.storage.local.set({
            latestProblem: message.data
        }, () => {
            console.log("Problem saved to storage");
            
            // Notify popup if it's open
            chrome.runtime.sendMessage({
                action: "problemReceived",
                data: message.data
            }).catch(() => {
                // Popup might not be open, that's okay
                console.log("Popup not open, problem saved to storage");
            });
        });
        
        // Send response back to content script
        sendResponse({ success: true, message: "Problem received and saved" });
        return true; // Keep message channel open for async response
    }

    if (message.action === "getLatestProblem") {
        chrome.storage.local.get(['latestProblem'], (result) => {
            sendResponse(result.latestProblem || null);
        });
        return true; // Keep message channel open for async response
    }
});