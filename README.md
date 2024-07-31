# Generative AI-Powered Chatbot

This project features a sophisticated AI-powered chatbot that leverages the Google Gemini Model and LangChain to provide intelligent responses and advanced functionalities. The chatbot is integrated into a web application with a Node.js and Express.js backend, a React.js frontend, and styled with Tailwind CSS.

## Features

1. **Ask Simple Questions**:
   - Utilizes the Google Gemini Pro-Vision model to answer user queries.
   - Employs LangChain for contextual understanding and maintaining chat history to enhance the accuracy of responses based on previous interactions.

2. **Provide Summaries for Large Texts**:
   - Leverages the Google Gemini Pro-Vision model to summarize lengthy text inputs efficiently.

3. **Document-Based Q&A**:
   - Allows users to upload various document formats (PDF, DOCX, TXT).
   - Uses the Gemini model to extract content from documents and answer questions based on the extracted text using a prompt template.

4. **Discover Image Insights**:
   - Supports image uploads and questions about the image content.
   - Uses the Gemini-1.5 Flash model to convert images to base64 and analyze their content to provide insightful answers.

## Technologies Used

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **AI Models**: Google Gemini Pro-Vision, Gemini-1.5 Flash
- **Other**: LangChain

