const config = useRuntimeConfig();
const perplexityAPIKey = config.public.PERPLEXITY_API_KEY;
const abstractAPIKey = config.public.ABSTRACT_API_KEY;

export function fetchPerplexityData(profile: any): Promise<any> {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${perplexityAPIKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        { role: "system", content: "Be precise and concise." },
        {
          role: "user",
          content: `Write me a list of five possible family members of this person: ${profile}, I want this list in a JSON format as the following example: {
            "first_name": "John",
            "last_name": "Doe",
            "sex": "M",
          }. To guide your search, you can look at the obytuary of this person if it exist. If it does exist, you will consider the familly members on this document as the primary and most reliable ones. Don't add any ancestor to the list (grandparents for example) and don't add anyone who is dead either. Don't add the person itself to the list, this is important.
`,
        },
      ],
    }),
  };

  return fetch("https://api.perplexity.ai/chat/completions", options)
    .then((response) => {
      // console.log("Response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      throw err;
    });
}

//abstract api for email validation
export function validateEmail(email: string) {
  const url = `https://emailvalidation.abstractapi.com/v1/?api_key=${abstractAPIKey}&email=${email}`;
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((err) => {
      console.error("Error fetching emails:", err);
      throw err;
    });
}
