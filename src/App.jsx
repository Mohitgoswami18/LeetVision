import React, { useEffect, useState } from 'react'

const App = () => {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [response, setResponse] = useState("");
  const [currentView, setCurrentView] = useState("options");

  useEffect(() => {
    // Get latest problem when popup opens
    const getLatestProblem = () => {
      chrome.runtime.sendMessage({ action: "getLatestProblem" }, (response) => {
        if (response) {
          setProblem(response.description || "");
          setSolution(response.solution || "");
        }
      });
    };

    // Listen for new problems from background script
    const messageListener = (message, sender, sendResponse) => {
      if (message.action === "problemReceived") {
        console.log("New problem received in popup:", message.data);
        setProblem(message.data.description || "");
        setSolution(message.data.solution || "");
      }
    };

    // Add listener
    chrome.runtime.onMessage.addListener(messageListener);
    
    // Get initial data
    getLatestProblem();

    // Cleanup listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  // Function to manually trigger content script extraction
  const extractCurrentProblem = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('leetcode.com/problems/')) {
        alert('Please navigate to a LeetCode problem page');
        return;
      }

      // Inject and execute the extraction script
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // This will trigger the extraction function
          if (typeof extractLeetCodeQuestion === 'function') {
            extractLeetCodeQuestion();
          } else {
            console.error('extractLeetCodeQuestion function not found');
          }
        }
      });
    } catch (error) {
      console.error('Error executing script:', error);
    }
  };

  const callAI = async (prompt) => {
    setCurrentView("answer");
    setResponse("Loading...");
    
    const body = {
      contents: [{
        parts: [
          { text: "You are a DSA instructor. Give short, direct answers." },
          { text: `${prompt}:\n\ncode:\n${solution}` }
        ]
      }]
    };

    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key':"AIzaSyABuSoxV6fcVxug-yqMt5ZrBk-5lbwOz7M",
        },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      setResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error fetching answer.");
    } catch (error) {
      setResponse("API Error.");
    }
  };

  const callForHint = async (prompt) => {
    setCurrentView("answer");
    setResponse("Loading...");

    const body = {
      contents: [
        {
          parts: [
            { text: "You are a DSA instructor. Give short, direct answers." },
            { text: `${prompt}:\n\problem:\n${problem}` },
          ],
        },
      ],
    };

    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": "AIzaSyABuSoxV6fcVxug-yqMt5ZrBk-5lbwOz7M",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await res.json();
      setResponse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Error fetching answer."
      );
    } catch (error) {
      setResponse("API Error.");
    }
  };

  return (
    <div className='p-2 text-sm w-[300px]'>
      <h1 className='font-bold text-center'>LeetCode AI Assistant</h1>
      
      {/* Extract Button */}
      <button 
        onClick={extractCurrentProblem} 
        className='w-full mt-2 mb-2 border p-1 rounded bg-blue-500 text-white hover:bg-blue-600'
      >
        Extract Current Problem
      </button>

      {/* Show if problem is loaded */}
      {problem && (
        <div className='mb-2 p-2 bg-green-100 rounded text-xs'>
          ✅ Problem loaded ({problem.length} chars)
        </div>
      )}

      {currentView === 'options' && (
        <div className='flex flex-col gap-2 mt-4'>
          <button 
            onClick={() => callForHint("Give a hint for solving this problem")} 
            className='border p-1 rounded'
            disabled={!problem}
          >
            Hints
          </button>
          <button 
            onClick={() => callAI("Estimate time complexity and space complexity of this code.")} 
            className='border p-1 rounded'
            disabled={!problem}
          >
            Complexities
          </button>
          <button 
            onClick={() => setCurrentView("chat")} 
            className='border p-1 rounded'
            disabled={!problem}
          >
            Ask a question
          </button>
          
        </div>
      )}

      {currentView === 'answer' && (
        <div className='mt-4'>
          <div className='max-h-64 overflow-y-auto p-2 border rounded bg-gray-50'>
            <p className='whitespace-pre-wrap'>{response}</p>
          </div>
          <button 
            className='mt-2 border p-1 rounded w-full' 
            onClick={() => setCurrentView("options")}
          >
            Back
          </button>
        </div>
      )}

      {currentView === 'chat' && (
        <Chat problem={problem} solution={solution} setCurrentView={setCurrentView} />
      )}
    </div>
  )
}

const Chat = ({ problem, solution, setCurrentView }) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    const body = {
      contents: [{
        parts: [
          { text: "You are a DSA instructor. Give short answers." },
          { text: `Question: ${message}\n\nProblem:\n${problem}\n\nSolution:\n${solution}` }
        ]
      }]
    };

    try {
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': 'AIzaSyABuSoxV6fcVxug-yqMt5ZrBk-5lbwOz7M'
        },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      setResponse(data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error fetching answer.");
    } catch (error) {
      setResponse("API Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-2 mt-4'>
      <button 
        className='mb-2 border p-1 rounded text-xs' 
        onClick={() => setCurrentView("options")}
      >
        ← Back to Options
      </button>
      
      <input 
        type="text" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        className='border p-1 rounded' 
        placeholder='Ask your DSA question...'
        onKeyPress={(e) => e.key === 'Enter' && handleChat()}
      />
      
      <button 
        onClick={handleChat} 
        className='border p-1 rounded'
        disabled={loading || !message.trim()}
      >
        {loading ? 'Asking...' : 'Ask'}
      </button>
      
      {response && (
        <div className='mt-2 max-h-64 overflow-y-auto p-2 border rounded bg-gray-50'>
          <p className='whitespace-pre-wrap'>{response}</p>
        </div>
      )}
    </div>
  )
}

export default App;

