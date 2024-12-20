// ==UserScript==
// @name         MoodleAI
// @namespace    http://tampermonkey.net/
// @version      2024-12-18
// @description  Automatically generates a response based on a question and its answers on a webpage.
// @author       You
// @match        https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
// @grant        none
// ==/UserScript==

(function () {
    "use strict";
  
    const API_KEY = "sk-"; // Replace with your OpenAI API key
    const AI_MODEL = "gpt-4o-mini"; // Updated to use GPT-4 or a later supported model, also gpt-4o
    const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";
  
    // Function to extract text content of an element
    const getTextContent = (selector, errorMessage) => {
      const element = document.querySelector(selector);
      if (!element) {
        console.error(errorMessage);
        return null;
      }
      return element.innerText.trim();
    };
  
    // Build the prompt for the AI model
    const buildPrompt = () => {
      const questionText = getTextContent(".qtext", "Question element not found.");
      if (!questionText) return null;
  
      const answersText = getTextContent(".answer", "Answer container not found.");
      if (!answersText) return null;
  
      return (
        'Provide ONLY the alphabetical letter corresponding to the correct answer for the following question, for example if the right answer is the letter a, just print "a", no other text. If it is a true/false, just answer with a for true and b for false:\n' +
        questionText + "\n" + answersText
      );
    };
  
    // Function to send a request to the OpenAI API
    const generateText = async (prompt, apiKey) => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: AI_MODEL,
            messages: [{ role: "user", content: prompt }], 
            max_tokens: 8,
            temperature: 0.3, //setting in order to get the most accurate answer for math questions
          }),
        });
  
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        return data.choices[0].message.content.trim();
      } catch (error) {
        console.error("Error in fetch request:", error);
        throw error;
      }
    };
  
    // Function to handle the AI response and select the appropriate answer
    const handleResponse = (responseText) => {
      const answerContainer = document.querySelector(".answer");
      if (!answerContainer) {
        console.error("Answer container not found.");
        return;
      }
  
      const radioButtons = Array.from(answerContainer.querySelectorAll('input[type="radio"]'));
      const index = responseText.charCodeAt(0) - "a".charCodeAt(0); 
  
      if (index >= 0 && index < radioButtons.length) {
        radioButtons[index].click();
        console.log(`Selected option: ${responseText}`);
      } else {
        console.error(`Invalid response: ${responseText}`);
      }
    };
  
    // Main function
    const main = async () => {
      const prompt = buildPrompt();
      if (!prompt) return;
  
      try {
        const responseText = await generateText(prompt, API_KEY);
        handleResponse(responseText);
      } catch (error) {
        console.error("Error generating or handling response:", error);
      }
    };
  
    // Run the script
    main();
  })();
  