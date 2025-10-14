# AI SDK Multi-Turn Tracing with Braintrust

This repository demonstrates how to implement multi-turn conversation tracing using the [Vercel AI SDK](https://sdk.vercel.ai/) and [Braintrust](https://www.braintrust.dev/) for comprehensive observability and debugging of AI applications.

## 🎥 Demo

<video width="600" controls>
  <source src="CleanShot 2025-10-14 at 16.19.42.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

*Note: If the video doesn't load, you can [download it directly](CleanShot%202025-10-14%20at%2016.19.42.mp4) from the repository.*

## 🚀 Features

- **Multi-turn conversations** with conversation history tracking
- **Tool calling** with weather API simulation
- **Automatic tracing** of all AI SDK interactions
- **Input/output logging** for each conversation turn
- **Conversation ID tracking** for session management
- **CLI interface** for interactive testing

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key
- Braintrust API key

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/dpguthrie/ai-sdk-multi-turn-example.git
cd ai-sdk-multi-turn-example
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your API keys:
```env
OPENAI_API_KEY=sk-your-openai-api-key
BRAINTRUST_API_KEY=your-braintrust-api-key
```

## 🏃‍♂️ Usage

Start the chatbot:
```bash
npm start
# or
npx tsx chatbot.ts
```

The chatbot will:
1. Initialize a Braintrust project called "ai-sdk-example"
2. Generate a unique conversation ID
3. Start an interactive CLI session
4. Automatically trace all interactions

### Example Interaction

```
Chatbot ready! Conversation ID: 123e4567-e89b-12d3-a456-426614174000
Type your message (or "exit" to quit):

You: What's the weather like in San Francisco?
Assistant: I'll check the weather in San Francisco for you.

The weather in San Francisco is 22°C and sunny.

You: How about New York?
Assistant: Let me get the current weather for New York.

The weather in New York is 18°C and cloudy.
```

## 🏗️ Architecture

### Key Components

1. **Braintrust Integration**
   - `initLogger()` - Initialize Braintrust project
   - `wrapAISDK()` - Wrap AI SDK functions for automatic tracing
   - `traced()` - Manual span creation for custom logic

2. **AI SDK Integration**
   - `generateText()` - Core text generation with tool support
   - Tool definitions with Zod schemas
   - Multi-step conversation handling

3. **Tracing Strategy**
   - Each conversation turn wrapped in a `traced` span
   - Input/output logging for debugging
   - Conversation ID tracking across turns
   - Tool call tracing

### Code Structure

```typescript
// Initialize Braintrust
initLogger({
  projectName: 'ai-sdk-example',
  apiKey: process.env.BRAINTRUST_API_KEY,
});

// Wrap AI SDK for automatic tracing
const { generateText } = wrapAISDK(ai);

// Manual tracing for conversation turns
return traced(
  async (span) => {
    // Log input state
    span.log({ input: messages, metadata: { conversation_id: conversationId } });
    
    // AI SDK call with tools
    const result = await generateText({
      model: openai('gpt-4o-mini'),
      messages: messages,
      tools: { /* tool definitions */ },
    });
    
    // Log output state
    span.log({ output: [...messages] });
    
    return text;
  },
  { name: 'chat-turn', type: 'task' }
);
```

## 📚 Documentation Links

### Vercel AI SDK
- [Getting Started](https://sdk.vercel.ai/docs/getting-started)
- [generateText API](https://sdk.vercel.ai/docs/reference/ai/generate-text)
- [Tool Calling](https://sdk.vercel.ai/docs/guides/tools)
- [Multi-step Conversations](https://sdk.vercel.ai/docs/guides/multi-step)

### Braintrust
- [Quick Start](https://www.braintrust.dev/docs/getting-started)
- [Tracing Guide](https://www.braintrust.dev/docs/guides/tracing)
- [AI SDK Integration](https://www.braintrust.dev/docs/guides/ai-sdk)
- [Span API Reference](https://www.braintrust.dev/docs/reference/span)

### OpenAI
- [API Reference](https://platform.openai.com/docs/api-reference)
- [GPT-4o Mini](https://platform.openai.com/docs/models/gpt-4o-mini)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ |
| `BRAINTRUST_API_KEY` | Your Braintrust API key | ✅ |

### Model Configuration

The example uses `gpt-4o-mini` for cost-effective conversations. You can modify the model in `chatbot.ts`:

```typescript
const result = await generateText({
  model: openai('gpt-4o-mini'), // Change to 'gpt-4o', 'gpt-4', etc.
  // ...
});
```

## 🎯 Tracing Features

### What Gets Traced

- **Input/Output**: Each conversation turn's messages
- **Tool Calls**: Weather API calls with parameters and results
- **Model Interactions**: All AI SDK generateText calls
- **Conversation Flow**: Multi-turn conversation history
- **Metadata**: Conversation IDs, timestamps, and custom data

### Braintrust Dashboard

After running conversations, view traces in your [Braintrust dashboard](https://www.braintrust.dev/app):

1. Navigate to your "ai-sdk-example" project
2. View conversation traces with input/output data
3. Analyze tool call performance
4. Debug conversation flows

## 🛠️ Development

### Adding New Tools

1. Define the tool function:
```typescript
const myTool = async ({ param }: { param: string }) => {
  // Tool logic
  return result;
};
```

2. Add to the tools object:
```typescript
tools: {
  myTool: {
    description: 'Tool description',
    inputSchema: z.object({
      param: z.string().describe('Parameter description'),
    }),
    execute: myTool,
  },
}
```

### Custom Tracing

For custom tracing beyond AI SDK calls:

```typescript
return traced(
  async (span) => {
    span.log({ metadata: {custom_data: 'value'} });
    // Your custom logic
    return result;
  },
  { name: 'custom-operation', type: 'task' }
);
```

## 📦 Dependencies

- **@ai-sdk/openai**: OpenAI provider for AI SDK
- **ai**: Vercel AI SDK core
- **braintrust**: Observability and tracing platform
- **zod**: Schema validation for tool parameters
- **dotenv**: Environment variable management
- **tsx**: TypeScript execution
- **@types/node**: Node.js type definitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm start`
5. Submit a pull request

## 🔗 Links

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [Braintrust Documentation](https://www.braintrust.dev/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Zod Documentation](https://zod.dev/)
