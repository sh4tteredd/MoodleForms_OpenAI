#     MoodleFormsTool_OpenAI

A Tampermonkey script that automatically generates responses based on questions and answers from a webpage. It integrates with the OpenAI API to process the content and provide concise answers.

## Features

- Parses question and answer content from a webpage.
- Utilizes OpenAI's GPT-4 or later supported models to generate responses.
- Embeds the generated response directly into the webpage for easy access.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Create a new script in Tampermonkey and replace the content with the provided code.
3. Save the script.

## Requirements

- A valid OpenAI API key. Replace the placeholder in the script (`const API_KEY = 'sk-';`) with your actual API key.
- in the script creation window, go to the settings tab and add the following to the User Includes section:
- `/^https:\/\/page_name?\/mod\/quiz\/attempt\.php\?(:*)/`
  - Replace page_name with the domain you want to use.


## How It Works

1. The script identifies the question and answer elements on the webpage.
2. It constructs a prompt to send to the OpenAI API.
3. The OpenAI API generates a response based on the question and answer data.
4. The script appends the AI-generated response to the page.

## Customization

- **Model Selection**: You can modify the `AI_MODEL` constant to use different models supported by OpenAI.
- **Prompt Adjustments**: Update the `prompt` variable to change the format of the question and answer input.
- **API Endpoint**: If OpenAI updates its API, ensure the `API_ENDPOINT` is updated accordingly.



