const {
    GoogleGenerativeAI,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    JSON: true,
});

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
};

export async function ChatWithAI({ prompt }: { prompt: string }) {
    const chatSession = model.startChat({
        generationConfig,
        history: [
            {
                role: "user",
                parts: [
                    { text: "description: Student registration for coding workshop on React and react native, ON the basis of description pleases give form in json format with title, form subheading, form field, form name, placeholder name, and form label, in json format\n" },
                ],
            },
            {
                role: "model",
                parts: [
                    { text: "\n{\n  \"title\": \"React & React Native Coding Workshop Registration\",\n  \"subheading\": \"Join us for an immersive workshop on building web and mobile applications with React and React Native.\",\n  \"form_name\": \"registration_form\",\n  \"fields\": [\n    {\n      \"type\": \"text\",\n      \"name\": \"first_name\",\n      \"label\": \"First Name\",\n      \"placeholder\": \"Enter your first name\"\n    },\n    {\n      \"type\": \"text\",\n      \"name\": \"last_name\",\n      \"label\": \"Last Name\",\n      \"placeholder\": \"Enter your last name\"\n    },\n    {\n      \"type\": \"email\",\n      \"name\": \"email\",\n      \"label\": \"Email Address\",\n      \"placeholder\": \"Enter your email address\"\n    },\n    {\n      \"type\": \"select\",\n      \"name\": \"experience_level\",\n      \"label\": \"Experience Level\",\n      \"options\": [\n        { \"value\": \"beginner\", \"label\": \"Beginner\" },\n        { \"value\": \"intermediate\", \"label\": \"Intermediate\" },\n        { \"value\": \"advanced\", \"label\": \"Advanced\" }\n      ]\n    },\n    {\n      \"type\": \"textarea\",\n      \"name\": \"reason_for_attending\",\n      \"label\": \"Reason for Attending\",\n      \"placeholder\": \"Tell us why you're interested in this workshop\"\n    },\n    {\n      \"type\": \"checkbox\",\n      \"name\": \"agree_to_terms\",\n      \"label\": \"I agree to the workshop terms and conditions\",\n      \"required\": true\n    }\n  ]\n}\n\n**Explanation of the JSON format:**\n\n* **title**: The main title of the registration form.\n* **subheading**: A brief description of the workshop.\n* **form_name**: A unique identifier for the form.\n* **fields**: An array of objects, each representing a form field.\n    * **type**: The type of input field (e.g., \"text\", \"email\", \"select\", \"textarea\", \"checkbox\").\n    * **name**: The name attribute of the field (used for submitting the form data).\n    * **label**: The label displayed next to the field.\n    * **placeholder**: The placeholder text within the input field.\n    * **options**: For select fields, an array of objects with \"value\" and \"label\" for each option.\n    * **required**: Whether the field is mandatory (defaults to `false`).\n Don't generate any files upload fields\nThis JSON format provides a structured representation of the form fields, making it easy to process and display the registration form in different interfaces.\n" },
                ],
            },
        ],
    });

    const result = await chatSession.sendMessage(prompt);
    return result;
}
