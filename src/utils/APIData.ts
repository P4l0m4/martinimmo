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

export async function perplexityEmailScan(
  emailObject: string,
  emailBody: string
): Promise<any> {
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
          content: `Voici l\'objet d\'un mail: ( ${emailObject} ) et voici le contenu du mail: ( ${emailBody} ). Je veux que tu notes cet email selon les critères figurant dans le code json suivant.
          {
  "criteria": [
    {
      "category": "Contenu et structure",
      "sub_criteria": {
        "Objet accrocheur et pertinent au sujet": true,
        "Longueur de l'objet entre 40 et 60 caractères": true,
        "Introduction claire et concise": true,
        "Identification explicite du problème": true,
        "Proposition de valeur clairement énoncée": true,
        "Appel à l'action clair pour le rendez-vous": true
      }
    },
    {
      "category": "Pertinence et ciblage",
      "sub_criteria": {
        "Référence à la situation spécifique du prospect": true,
        "Absence de généralités ou de contenu hors-sujet": true
      }
    },
    {
      "category": "Crédibilité et confiance",
      "sub_criteria": {
        "Présentation concise de vos qualifications ou expertise": true,
        "Mention d'éléments démontrant votre connaissance du marché local": true,
        "Explication brève de votre méthode ou approche": true
      }
    },
    {
      "category": "Style et lisibilité",
      "sub_criteria": {
        "Longueur appropriée (entre 50 et 200 mots pour le corps de l'email)": true,
        "Peu de paragraphes, de 2 à 4 phrases chacun": true,
        "Pas d'excès de ponctuation (trop de points d'exclamation ou de majuscules)": true
      }
    },
    {
      "category": "Langue et ton",
      "sub_criteria": {
        "Absence de fautes d'orthographe et de grammaire": true,
        "Ton professionnel mais sympathique": true,
        "Langage simple et direct": true
      }
    },
    {
      "category": "Anti SPAM",
      "sub_criteria": {
        "Absence de termes susceptibles de déclencher les filtres anti-spam ou de promotion": true
      }
    },
    {
      "category": "Persuasion",
      "sub_criteria": {
        "Anticipation et réponse aux objections potentielles": true,
        "Résumé des bénéfices clés en fin de message": true
      }
    }
  ]
}

          Par défault les valeurs sont à true, tu dois les passer à false si le critère n'est pas respecté. Renvoie moi le code json tel qu\'il t'a été donné en y apportant les modifications nécessaires. Tu ne dois en aucun cas modifier la syntaxe des critères, tu dois juste les passer à false si le critère n'est pas respecté. Assure toi de renvoyer les données dans un format json valide. Je ne veux aucune explication.
          
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
