// ==UserScript==
// @name         MoodleAI
// @namespace    http://tampermonkey.net/
// @version      2025-01-13
// @description  Generates and selects answers (radio, checkboxes, or text
// areas) when the user presses the "K" key.
// @author       You
// @match        https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const API_KEY = "sk-proj-"; // Replace with your OpenAI API key
  const AI_MODEL = "gpt-4o-mini";
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
    const questionText = getTextContent(
      ".qtext",
      "Question element not found."
    );
    if (!questionText) return null;

    const answersText = getTextContent(
      ".answer",
      "Answer container not found."
    );
    if (!answersText) return null;

    if (!answersText.includes("Rich text editor")) {
      // Non è domanda a risposta aperta
      return (
        'Provide ONLY the correct answers for the following question. If there are multiple correct answers, separate them by commas (e.g., "a,c"). For single-choice questions, provide the single correct letter (e.g., "a"). For true/false, answer "a" for true and "b" for false:\n' +
        questionText +
        "\n" +
        answersText
      );
    } else {
      return "Give a synthetic and fluent answer:\n" + questionText;
    }
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
          max_tokens: 200, // Increase tokens for open-ended questions
          temperature: 0.7, // Adjust for more creative answers
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

  // Function to handle the AI response and populate the appropriate field
  const handleResponse = (responseText) => {
    const answersText = getTextContent(
      ".answer",
      "Answer container not found."
    );

    if (!answersText.includes("Rich text editor")) {
      // Non è domanda a risposta aperta
      const answerContainer = document.querySelector(".answer");
      if (!answerContainer) {
        console.error("Answer container not found.");
        return;
      }

      const inputs = Array.from(
        answerContainer.querySelectorAll(
          'input[type="radio"], input[type="checkbox"]'
        )
      );
      if (inputs.length === 0) {
        console.error("No input elements found.");
        return;
      }

      // Parse the AI response
      const selectedLetters = responseText
        .split(",")
        .map((letter) => letter.trim().toLowerCase());

      // Loop through each input and select those matching the response
      inputs.forEach((input, index) => {
        const correspondingLetter = String.fromCharCode(
          "a".charCodeAt(0) + index
        );
        if (selectedLetters.includes(correspondingLetter)) {
          input.checked = true;
          console.log(`Selected option: ${correspondingLetter}`);
        }
      });
    } else {
      // Inserisci la risposta AI in un campo contenteditable generico
      const editableDiv = document.querySelector("[contenteditable='true']");
      if (editableDiv) {
        editableDiv.innerHTML = `<p dir="ltr" style="text-align: left;">${responseText}</p>`;
        console.log("Answer inserted into text area.");
      } else {
        console.error("Editable div not found.");
      }
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

  // Event listener for the "K" key press
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "k") {
      // Check if the "K" key is pressed
      console.log("K key pressed, running AI...");
      main();
    }
  });
})();
