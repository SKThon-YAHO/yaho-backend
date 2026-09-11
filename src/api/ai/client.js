// src/ai/client.js
// Anthropic API 클라이언트를 한 곳에서만 생성해서 다른 AI 로직들이 공유해서 씀

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export default anthropic;