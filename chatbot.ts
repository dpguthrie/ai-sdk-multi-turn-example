import 'dotenv/config';
import { openai } from '@ai-sdk/openai';
import * as ai from 'ai';
import { initLogger, wrapAISDK, traced } from 'braintrust';
import { z } from 'zod';
import * as readline from 'readline';
import { randomUUID } from 'crypto';

// Initialize Braintrust logger
initLogger({
  projectName: 'ai-sdk-example',
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Wrap the AI SDK functions
const { generateText } = wrapAISDK(ai);

// Simple weather tool
const getWeather = async ({ city }: { city: string }) => {
  const weather = {
    temperature: Math.floor(Math.random() * 30) + 10,
    condition: ['sunny', 'cloudy', 'rainy'][Math.floor(Math.random() * 3)],
  };
  return `The weather in ${city} is ${weather.temperature}°C and ${weather.condition}.`;
};

// Store conversation history
const messages: Array<any> = [];

// Generate a unique conversation ID when the chatbot starts
const conversationId = randomUUID();

async function chat(userMessage: string) {
  // Capture input state (messages before this turn)
  const inputMessages = [...messages];
  
  // Wrap the entire chat turn in a traced span with input/output logging
  return traced(
    async (span) => {
      // Log the input state

      messages.push({
        role: 'user',
        content: userMessage,
      });

      span.log({ input: messages, metadata: { conversation_id: conversationId } });

      // Call the model with tool support and maxSteps
      const result = await generateText({
        model: openai('gpt-4o-mini'),
        messages: messages,
        tools: {
          getWeather: {
            description: 'Get the current weather for a city',
            inputSchema: z.object({
              city: z.string().describe('The city name'),
            }),
            execute: getWeather,
          },
        },
      });

      const { text, toolCalls, toolResults } = result;

      // If there were tool calls, add them to conversation history
      if (toolCalls && toolCalls.length > 0) {
        messages.push({
          role: 'assistant',
          content: toolCalls,
        });
        messages.push({
          role: 'tool',
          content: toolResults,
        });
      }

      // Add assistant's final response to history
      messages.push({
        role: 'assistant',
        content: text,
      });

      // Log the output state (messages after this turn)
      span.log({ output: [...messages] });

      return text;
    },
    { 
      name: 'chat-turn', 
      type: 'task',
    }
  );
}

// Simple CLI interface
async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(`Chatbot ready! Conversation ID: ${conversationId}`);
  console.log('Type your message (or "exit" to quit):\n');

  const askQuestion = () => {
    rl.question('You: ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      const response = await chat(input);
      console.log(`Assistant: ${response}\n`);
      askQuestion();
    });
  };

  askQuestion();
}

main();
