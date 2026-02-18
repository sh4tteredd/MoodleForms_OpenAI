// ==UserScript==
// @name         MoodleAI
// @namespace    http://tampermonkey.net/
// @version      2026-02-18
// @description  Automate answering Moodle quiz questions using OpenAI's API. Press [|] to start. Designed for both multiple choice and open-ended questions. Customize prompts and API key in the script.
// @author       You
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // --- CONFIGURAZIONE ---
  const API_KEY =
    "sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Set your OpenAI API key here
  const AI_MODEL = "gpt-4o-mini";
  const MAX_TOKENS = 4000;

  const OPEN_QUESTION_PROMPT =
    "Write a comprehensive, detailed, and academic answer. Expand on the concepts, use technical terminology, and structure the text clearly. IMPORTANT: Ensure your response is completely finished and do not cut off mid-sentence:\n"; //edit the prompt for open questions as needed

  const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

  const log = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[MoodleAI ${timestamp}] ${msg}`);
  };

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
          max_tokens: MAX_TOKENS,
          temperature: 0.1, // set the temperature
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      log(`ERRORE FETCH: ${error.message}`);
      throw error;
    }
  };

  const main = async () => {
    log("scanning for questions...");
    const questionContainers = document.querySelectorAll(".que");

    if (questionContainers.length === 0) return;

    for (let i = 0; i < questionContainers.length; i++) {
      const currentQuestion = questionContainers[i];
      const qTextElement = currentQuestion.querySelector(".qtext");
      const answerElement = currentQuestion.querySelector(".answer");

      if (!qTextElement || !answerElement) continue;

      const questionText = qTextElement.innerText.trim();
      const answersText = answerElement.innerText.trim();

      log(`--------------------------------------------------`);
      log(`Processing Question ${i + 1}:\n${questionText}\nOptions:\n${answersText}`);

      const hasTinyMCE = currentQuestion.querySelector(".tox-tinymce") !== null;
      const isOpenEnded =
        hasTinyMCE ||
        answersText.includes("Rich text editor") ||
        currentQuestion.querySelector("[contenteditable='true']") !== null;

      let prompt = "";
      if (isOpenEnded) {
        prompt = OPEN_QUESTION_PROMPT + questionText;
      } else {
        prompt = `You are an expert Professor taking a university exam.
        TASK: Identify the correct option for the following question.

        STRATEGY:
          1. Analyze the question carefully, looking for keywords (dates, specific terminology, authors, laws).
          2. Evaluate each option (a, b, c...) against established academic knowledge.
          3. Discard distractors (answers that look plausible but are technically incorrect).
          4. Select the most accurate answer.

        Output your reasoning step-by-step to verify correctness.
        At the very end, output the final answer in this exact format: "FINAL_ANSWER: [letter]".

        Question:
        ${questionText}

        Options:
        ${answersText}`;
      } //edit the prompt for multiple choice questions as needed

      try {
        const responseText = await generateText(prompt, API_KEY);

        log(`AI Response:\n${responseText}`);

        if (!isOpenEnded) {
          const inputs = Array.from(
            currentQuestion.querySelectorAll(
              '.answer input[type="radio"], .answer input[type="checkbox"]',
            ),
          );

          if (inputs.length > 0) {
            let selectedLetters = [];

            const bracketMatch = responseText.match(
              /FINAL_ANSWER:\s*\[(.*?)\]/i,
            );

            if (bracketMatch) {
              selectedLetters = bracketMatch[1]
                .split(",")
                .map((l) => l.trim().toLowerCase());
            } else {
              // Fallback
                responseText.match(/\[([^\]]+)\][^\[]*$/);
              if (lastBracketMatch) {
                selectedLetters = lastBracketMatch[1]
                  .split(",")
                  .map((l) => l.trim().toLowerCase());
              }
            }

            log(`Lettera(e) estratta(e): ${selectedLetters.join(", ")}`);
            let found = false;

            inputs.forEach((input, index) => {
              let correspondingLetter = "";

              const labelId = input.getAttribute("aria-labelledby");
              const labelContainer = labelId
                ? document.getElementById(labelId)
                : input.parentElement;

              if (labelContainer) {
                const spanLetter =
                  labelContainer.querySelector(".answernumber");
                if (spanLetter) {
                  correspondingLetter = spanLetter.innerText
                    .replace(/[^a-zA-Z]/g, "")
                    .toLowerCase();
                }
              }

              if (!correspondingLetter) {
                correspondingLetter = String.fromCharCode(
                  "a".charCodeAt(0) + index,
                );
              }

              if (selectedLetters.includes(correspondingLetter)) {
                found = true;
                if (!input.checked) {
                  input.click();
                  input.checked = true;
                  input.dispatchEvent(new Event("change", { bubbles: true }));
                  log(
                    `-> Selected option [${correspondingLetter}] for question ${i + 1}`,
                  );
                }
              }
            });

            if (!found)
              log('Alert: not found any matching letter in the options. Please check the AI response format and the question structure.');
          }
        } else {
          // --- GESTIONE RISPOSTA APERTA INVARIATA ---
          const formattedResponse = responseText.replace(/\n/g, "<br>");
          const htmlResponse = `<p>${formattedResponse}</p>`;

          if (hasTinyMCE) {
            const iframe = currentQuestion.querySelector(
              '.tox-edit-area__iframe, iframe[id$="_ifr"]',
            );
            if (iframe) {
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow.document;
              const editorBody =
                iframeDoc.querySelector("#tinymce") || iframeDoc.body;

              if (editorBody) editorBody.innerHTML = htmlResponse;

              if (iframe.id && iframe.id.endsWith("_ifr")) {
                const baseId = iframe.id.replace("_ifr", "");
                const hiddenTextArea = document.getElementById(baseId);
                if (hiddenTextArea) {
                  hiddenTextArea.value = htmlResponse;
                  hiddenTextArea.dispatchEvent(
                    new Event("change", { bubbles: true }),
                  );
                }
              }
            }
          } else {
            const editableDiv = currentQuestion.querySelector(
              "[contenteditable='true']",
            );
            if (editableDiv) {
              editableDiv.innerHTML = htmlResponse;
              editableDiv.dispatchEvent(new Event("input", { bubbles: true }));
            }
          }
        }
      } catch (error) {
        log(`ERRORE CRITICO: ${error.message}`);
      }
    }
  };

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "|") {
      log("key [|] pressed - Starting MoodleAI...");
      main();
    }
  });
})();
