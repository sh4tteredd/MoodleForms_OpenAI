// ==UserScript==
// @name         Updated Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-12-18
// @description  Automatically generates a response based on a question and its answers on a webpage.
// @author       You
// @match        https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const API_KEY = 'sk-'; // Replace with your OpenAI API key
    const AI_MODEL = "gpt-4o-mini"; // Updated to use GPT-4 or a later supported model
    const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    // Initial prompt
    let prompt = 'Provide ONLY the alphabetical letter corresponding to the correct answer for the following question, for example if the right answer is the letter a, just print "a", no other text:\n';

    // Add the question text to the prompt
    const questionElement = document.querySelector(".qtext");
    if (questionElement) {
        prompt += questionElement.innerText + "\n";

    } else {
        console.error("Question element not found.");
        return;
    }

    // Iterate over the answers and append them to the prompt
    const answerContainer = document.querySelector(".answer");
    if (answerContainer) {
        let answers = document.querySelector(".answer").textContent;
        prompt = prompt + answers;

        console.log(prompt)
    } else {
        console.error("Answer container not found.");
        return;
    }

    // Generate the response
    generateText(prompt, API_KEY).then(responseText => {
        const infoContainer = document.querySelector(".info");
        if (infoContainer) {
            const responseNode = document.createTextNode(responseText);
            infoContainer.appendChild(responseNode);
        } else {
            console.error("Info container not found.");
        }
    }).catch(error => {
        console.error("Error generating response:", error);
    });

    // Function to send a request to the OpenAI API
    async function generateText(prompt, apiKey) {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [{
                        "role": "user",
                        "content": prompt
                    }],
                    max_tokens: 5, // Allow more tokens for additional flexibility
                    temperature: 0.7 // Adjust creativity level
                })
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
    }
})();
