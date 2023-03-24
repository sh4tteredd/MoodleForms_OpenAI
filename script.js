const API_KEY = 'INTRODUIR AQUÍ LA CLAU API';
const AI_MODEL = "gpt-3.5-turbo-0301";
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Prompt inicial
let prompt = 'Respon una lletra segons el ordre alfabétic que correspongui a la resposta de la pregunta següent:\n';

// Poblem el prompt amb la pregunta i les respostes actuals
prompt += document.getElementsByClassName("qtext")[0].innerText + "\n";
// Recorrem les respostes
var contenidorRespostes = document.getElementsByClassName("answer")[0];
for (let i = 0; i < contenidorRespostes.childNodes.length; i++) {
    const node = contenidorRespostes.childNodes[i];
    // Verificar si el node és una resposta i no un altre element (format classe: "r{num_de_resposta}")
    if (node.className && node.className.startsWith("r")) {
        prompt += node.innerText;
    }
}

// Generem resposta
generateText(prompt, API_KEY).then(text => {
    // Incloem la resposta en el HTML
    var textNode = document.createTextNode(text);
    document.getElementsByClassName("info")[0].childNodes[1].appendChild(textNode);
});


// Funció que fà petició a la API de OpenAPI
async function generateText(prompt, apiKey) {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`, // Autorització per la API
            'Access-Control-Allow-Origin': '*' // Permetre CORS
        },
        body: JSON.stringify({
            model: AI_MODEL,
            messages: [{
                "role": "user", // 'user' és el rol del emisor i 'asistant' el de la IA
                "content": prompt
            }],
            max_tokens: 1, // Maxim nombre de paraules
            temperature: 0.5 // Nivell de creativitat de la resposta entre 0 i 1
        })
    });

    const data = await response.json();
    const text = data.choices[0].message.content.trim();

    return text;
}
