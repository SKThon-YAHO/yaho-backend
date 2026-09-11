// src/ai/client.js
// Gemini API 클라이언트를 한 곳에서만 생성해서 다른 AI 로직들이 공유해서 씀

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default genAI;