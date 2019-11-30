// Example languages to translate to, English, Spanish, French
// ['en', 'es', 'fr']

// require xhr module. We'll be using 3rd party http endpoint for
// translation. We need to make a get request to the endpoint with
// parameters and we will get back the translated text in response. xhr
// module will help in sending out http requests.
const xhr = require('xhr');

const query = require('codec/query_string');
const base64 = require('codec/base64');

// Store your API key securely in the vault using the MY SECRETS button
// vault get param for your IBM key should be `ibm_translate_api_key`
const vault = require('vault');

export default (request) => {
    //API key
    return vault.get('ibm_translate_api_key').then((apiKey) => {

        // translation api url
        const apiUrl = 'https://gateway-lon.watsonplatform.net/language-translator/api/v3/translate?version=2018-05-01';

        var inputText = "";

        // Verify the message contains text to translate
        if(request.message.content && request.message.content.type && request.message.content.type === "text" && request.message.content.body) {
            inputText = request.message.content.body;
        }

        // Verify the message has been prepended with a translation model
        if (inputText.length > 7 && inputText[0] === '[' && inputText[3] === '-' && inputText[6] === ']') {
            // language to translate from
            var inLang = inputText.substring(1,3).toLowerCase();

            // language to translate to
            var outLang = inputText.substring(4,6).toLowerCase();

            inputText = inputText.substring(7);

            console.log("Translating text: " + inputText + " from " + inLang + " to " + outLang);

            // set the body's `model_id` to `input-output` format with 2 letter
            // language codes. Example: English to Spanish would be 'en-es'

            const body = {
                model_id: inLang + '-' + outLang,
                text: [inputText]
            };

            const httpOptions = {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + base64.btoa('apikey:' + apiKey),
                    'Content-Type': 'application/json'
                },
                body
            };

            // We'll invoke xhr fetch to get the HTTP response
            return xhr.fetch(apiUrl, httpOptions)
                .then(r => {
                    const body = JSON.parse(r.body);
                    request.message.content.body = body.translations[0].translation;
                    return request.ok();
                })
                .catch((e) => {
                    console.error(e);
                    return request.abort();
                });
        }
        return request.ok();
    });
};
