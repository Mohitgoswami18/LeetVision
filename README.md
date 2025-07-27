# 🧠 LeetVision – Your LeetCode AI Assistant

**LeetVision** is a powerful Chrome Extension designed to enhance your LeetCode experience. It offers instant AI-powered hints, solution complexity analysis, and custom DSA answers — all while you're solving problems.

---

## 🚀 Features

- 🔍 **Extract LeetCode Problem Automatically**  
  Seamlessly grab the currently open LeetCode problem and its solution.

- 🤖 **AI-Powered Assistant**  
  Get instant:
  - Hints to guide your thinking
  - Time & space complexity analysis
  - Whether your solution is optimal or improvable
  - Custom DSA answers via chatbot


---

## 🖼️ Preview

<img width="458" height="360" alt="image" src="https://github.com/user-attachments/assets/3397e9fe-2736-40f8-8738-df5459713a3d" />

---
## 🔧 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Chrome_Extension-FF7139?style=for-the-badge&logo=googlechrome&logoColor=white" />
</p>

---


## 📦 Installation (For Developers)

1. Clone the repo:
   ```bash
   git clone https://github.com/Mohitgoswami18/LeetVision.git
   cd leetvision
   ```
2. Install dependencies
   ```
   npm install
   ```
3. Execute Build command
    ```
    npm run build
    ```
4. After building, either manually copy the following files into the `dist/` folder :

- `manifest.json`
- `public/icon.png`
- `public/contentScript.js`
- `public/background.js`

  OR run these commands
```
  cp manifest.json dist/
  cp public/icon.png dist/
  cp public/contentScript.js dist/
```
5. Load it into Chrome:
 ```
  Go to chrome://extensions
  Enable "Developer mode"
  Click "Load unpacked" (on top left corner)
  Select the dist/ folder
```

you can also reffer the sample video below

🤝 Contributing
Pull requests are welcome. If you have suggestions or ideas, open an issue or submit a PR!



🌟 Show Your Support
If you like this project, give it a ⭐ on GitHub or share it with your fellow coders!

![License](https://img.shields.io/github/license/Mohitgoswami18/LeetVision?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/Mohitgoswami18/LeetVision?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/Mohitgoswami18/LeetVision?style=for-the-badge)
