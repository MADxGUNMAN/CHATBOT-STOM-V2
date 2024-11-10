const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const toggleVersionButton = document.querySelector("#toggle-version-button");

// State variables
let userMessage = null;
let isResponseGenerating = false;

// API configuration
const API_KEY = "AIzaSyCEQgFAd21M_Oakzr2jgHmQlLV20UVemRE"; // Your API key here
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

// Load theme and chat data from local storage on page load
const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

  // Apply the stored theme
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";

  // Restore saved chats or clear the chat container
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
}

// Create a new message element and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Show typing effect by displaying words one by one
const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let currentWordIndex = 0;

  const typingInterval = setInterval(() => {
    // Append each word to the text element with a space
    textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");

    // If all words are displayed
    if (currentWordIndex === words.length) {
      clearInterval(typingInterval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML); // Save chats to local storage
     // Add speak icon here after typing finishes
      const speakButton = document.createElement("span");
      speakButton.className = "icon material-symbols-rounded";
      speakButton.innerText = "volume_up"; // Speaker icon
      speakButton.onclick = () => speakText(text); // Attach text-to-speech function
      incomingMessageDiv.appendChild(speakButton);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  }, 75);
};
// Add the speakText function for text-to-speech
let isSpeaking = false; // Track the speaking state

// Function to toggle speaking the given text
const speakText = (text) => {
  const cleanedText = text.replace(/[*#:]/g, ""); // Removes *, #, and :
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel(); // Stop speaking if already in progress
    isSpeaking = false;
  } else {



    const speech = new SpeechSynthesisUtterance(cleanedText);
    speech.lang = 'en-US'; // Customize language as needed
    speech.rate = 1; // Set speaking rate
    speech.pitch = 1; // Set pitch level
    speechSynthesis.speak(speech);
    isSpeaking = true;
  }
};

// Fetch response from the API based on user message
const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text"); // Getting text element

  try {
    // Send a POST request to the API with the user's message
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        contents: [{ 
          role: "user", 
          parts: [{ text: userMessage }] 
        }] 
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    // Get the API response text and remove asterisks from it
    const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(apiResponse, textElement, incomingMessageDiv); // Show typing effect
  } catch (error) { // Handle error
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
}

// Show a loading animation while waiting for the API response
const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="images/gemini.svg" alt="Gemini avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);

  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom
  generateAPIResponse(incomingMessageDiv);
}

// Copy message text to the clipboard
const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;

  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done"; // Show confirmation icon
  setTimeout(() => copyButton.innerText = "content_copy", 1000); // Revert icon after 1 second
}

// Handle sending outgoing chat messages
const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if(!userMessage || isResponseGenerating) return; // Exit if there is no message or response is generating

  isResponseGenerating = true;

  const html = `<div class="message-content">
                  <img class="avatar" src="images/img.png" alt="User avatar">
                  <p class="text"></p>
                </div>`;

  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  
  typingForm.reset(); // Clear input field
  document.body.classList.add("hide-header");
  chatContainer.scrollTo(0, chatContainer.scrollHeight); // Scroll to the bottom







    // Custom response for "Who is your creator?" question
// Function to check if the user message is a creator-related question
function isCreatorQuestion(userMessage) {
  const creatorQuestions = [
    "who is your creator",
    "who creates you",
    "who creat you",
    "who made you",
    "who developed you",
    "creator",
    "who built you"
  ];
  
  return creatorQuestions.some(question => userMessage.toLowerCase() === question);
}

// Main code to handle user message
if (isCreatorQuestion(userMessage)) {
  const botResponse = `I am created by Ansari Shoaib.
                       <a href="https://www.instagram.com/sohaib._.908/" target="_blank" style="color: #00acee; text-decoration: none;">
                         Meet My Boss
                       </a>`;
  const incomingMessageDiv = createMessageElement(`<div class="message-content"><p class="text">${botResponse}</p></div>`, "incoming");
  chatContainer.appendChild(incomingMessageDiv);
  isResponseGenerating = false;
  return;
}

if ( 
  userMessage.toLowerCase() === "jhathu" || 
  userMessage.toLowerCase() === "bhosdka" || 
  userMessage.toLowerCase() === "tari ma ka bhosda" || 
  userMessage.toLowerCase() === "madarchod" ||
  userMessage.toLowerCase() === "mother fucker" ||
  userMessage.toLowerCase() === "fuck you") {
 const botResponse = `I want to make it clear that if you say anything disrespectful to me, I will report it to the police. This includes sending your location, IP address, and any other relevant details to them.
 YOUR IP:- 
   
   Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . : https://www.police.gov.in/
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
`;
 const incomingMessageDiv = createMessageElement(`<div class="message-content"><p class="text">${botResponse}</p></div>`, "incoming");
 chatContainer.appendChild(incomingMessageDiv);
 isResponseGenerating = false;
 return;
}
// Function to check if the user message is a name-related question
function isNameQuestion(userMessage) {
  const nameQuestions = [
    "what is your name",
    "what's your name",
    "your name",
    "who are you",
    "what your name",
    "do you have a name"
  ];
  
  return nameQuestions.some(question => userMessage.toLowerCase() === question);
}

// Main code to handle user message
if (isNameQuestion(userMessage)) {
  const botResponse = `I AM STORM, AN AI CHATBOT.`;
  const incomingMessageDiv = createMessageElement(`<div class="message-content"><p class="text">${botResponse}</p></div>`, "incoming");
  chatContainer.appendChild(incomingMessageDiv);
  isResponseGenerating = false;
  return;
}






  setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  
  // Set text color for light mode
  document.querySelectorAll(".text, .title, .subtitle").forEach(element => {
    element.style.color = isLightMode ? "black" : "";
  });
});





// Delete all chats from local storage when button is clicked
deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

// TOGGLE BETWEEN MOBILE AND DESKTOP VERSION
document.addEventListener("DOMContentLoaded", () => {
  const toggleVersionButton = document.querySelector("#toggle-version-button");

  if (toggleVersionButton) {
    toggleVersionButton.addEventListener("click", () => {
      window.open("https://madxgunman.github.io/chat-bot-stom/", "_blank"); // Opens the mobile version in a new tab for all users
    });
  } else {
    console.error("Toggle button not found!");
  }
});



// Set userMessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

// Prevent default form submission and handle outgoing chat
typingForm.addEventListener("submit", (e) => {
  e.preventDefault(); 
  handleOutgoingChat();
});

loadDataFromLocalstorage();


