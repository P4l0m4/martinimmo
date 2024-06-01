const config = useRuntimeConfig();
const APIKey = config.public.PERPLEXITY_API_KEY;

export function fetchPerplexityData(profile: any): Promise<any> {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${APIKey}`,
    },
    body: JSON.stringify({
      model: "llama-3-sonar-small-32k-online",
      messages: [
        { role: "system", content: "Be precise and concise." },
        {
          role: "user",
          content: `Write me a list of possible family members of this person: ${profile}, I want this list in a JSON format as the following example: {
            "first_name": "John",
            "last_name": "Doe"
          }. To guide your search, you can look at the obytuary of this person if it exist. If it does exist, you will consider the familly members on this document as the primary and most reliable ones.
`,
        },
      ],
    }),
  };

  return fetch("https://api.perplexity.ai/chat/completions", options)
    .then((response) => {
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
