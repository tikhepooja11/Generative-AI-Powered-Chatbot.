import { response } from "express";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import fs from "fs";
import { HumanMessage } from "@langchain/core/messages";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { BufferMemory } from "langchain/memory";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
//Import the Chains module
import { LLMChain } from "langchain/chains";

//Import the PromptTemplate module
import { PromptTemplate } from "@langchain/core/prompts";
import { PDFDocument } from "pdf-lib";
import mammoth from "mammoth";
import { dirname } from "path";

const genAIModel = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  maxOutputTokens: 2048,
  apiKey: "AIzaSyD1sXCPeXUhzkMnoEsz69Gxu61RU4UWrR4",
});
const memory = new BufferMemory({ memoryKey: "chat_history" });
//Instantiate the BufferMemory passing the memory key for storing state
//Create the template. The template is actually a "parameterized prompt". A "parameterized prompt" is a prompt in which the input parameter names are used and the parameter values are supplied from external input
//Note the input variables {chat_history} and {input}
const template = `The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details from its context. If the AI does not know the answer to a question, it truthfully says it does not know.
      Current conversation:
      {chat_history}
      Human: {input}
      AI:`;

//Instantiate "PromptTemplate" passing the prompt template string initialized above
const prompt = PromptTemplate.fromTemplate(template);

export const handleQuery = async (req, res) => {
  console.log("inside handlequery");
  const { question } = req.body;

  try {
    //Instantiate LLMChain, which consists of a PromptTemplate, an LLM and memory.
    const chain = new LLMChain({ llm: genAIModel, prompt, memory });
    //Run the chain passing a value for the {input} variable. The result will be stored in {chat_history}
    console.log(chain);
    console.log(question);
    const genAIModelResponse = await chain.call({ input: `${question}` });
    console.log(genAIModelResponse);
    const answer = genAIModelResponse.text;
    res.json({ answer });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

export const handlePractice = async (req, res) => {
  console.log(req.body);
  const { topic } = req.body;
  const prompt = `Generate practice problems for the topic: ${topic}`;
  try {
    const response = await genAIModel.invoke(prompt);
    console.log(response.text);
    res.json({ problems: response.text });
  } catch (error) {
    response
      .status(500)
      .json({ error: "An error occurred while generating practice problems." });
  }
};

export const handleExplain = async (req, res) => {
  const { text } = req.body;

  const prompt = `Provide a summary or explanation of the following text: ${text}`;
  try {
    const response = await genAIModel.invoke(prompt);
    console.log(response.text);
    res.json({ explanation: response.text });
  } catch (error) {
    response
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
};

export const provideImageContext = async (req, res) => {
  try {
    // Extract question and image from request
    const question = req.body.question;
    const reqImage = req.file;

    // Check if the image is provided
    if (!reqImage) {
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("Image received:", reqImage.path);
    console.log("Question:", question);

    // Initialize the API client
    const vision = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash",
      maxOutputTokens: 2048,
    });

    // Read and encode the image
    const filePath = reqImage.path;
    let image;
    try {
      image = fs.readFileSync(filePath).toString("base64");
    } catch (err) {
      console.error("Error reading image file:", err);
      return res.status(500).json({ error: "Error reading image file" });
    }

    // Prepare input for the API
    const input2 = [
      new HumanMessage({
        content: [
          {
            type: "text",
            text: `${question}`,
          },
          {
            type: "image_url",
            image_url: `data:image/png;base64,${image}`,
          },
        ],
      }),
    ];

    // Call the API
    let imageResponse;
    try {
      imageResponse = await vision.invoke(input2);
    } catch (err) {
      console.error("Error invoking the AI model:", err);
      return res.status(500).json({ error: "Error invoking the AI model" });
    }

    console.log(imageResponse.content);
    res.json({ imageSummary: imageResponse.content });
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).json({ error: "An unexpected error occurred" });
  }
};

export const provideDocumentSummary = async (req, res) => {
  // Extract question and file from request
  console.log("inside document backend");
  console.log(req.file);
  const { fileQuestion } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const genAIModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 2048,
    apiKey: "AIzaSyD1sXCPeXUhzkMnoEsz69Gxu61RU4UWrR4",
  });

  const filePath = file.path;
  let textContent = "";

  // Extract text based on file type
  try {
    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfDoc = await PDFDocument.load(dataBuffer);
      const pages = pdfDoc.getPages();
      const textPromises = pages.map((page) => page.getTextContent());

      // Combine text from all pages
      const texts = await Promise.all(textPromises);
      textContent = texts
        .flat()
        .map((textItem) => textItem.str)
        .join(" ");
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      // Handling DOCX files with mammoth
      const result = await mammoth.extractRawText({ path: filePath });
      textContent = result.value;
    } else if (req.file.mimetype === "text/plain") {
      textContent = fs.readFileSync(filePath, "utf-8");
    } else {
      return res.status(400).send("Unsupported file type.");
    }

    const prompt = `Based on the following text, answer this question: ${fileQuestion}\n\ntext: ${textContent}`;

    // Query the Google Gemini model
    try {
      const modelResponse = await genAIModel.invoke(prompt);
      console.log(modelResponse.content);
      res.json({ answer: modelResponse.content });
    } catch (modelError) {
      console.error("Error querying the model:", modelError);
      res.status(500).send("Error querying the model.");
    }

    //
  } catch (error) {
    console.log("i am here");
    console.error(error);
    res.status(500).send("Error processing the file.");
  }
};
