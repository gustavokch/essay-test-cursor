# Essay AI Demo

A demonstration project showing how different AI models handle writing tasks. This project generates an essay based on a user prompt, has a different AI model review it, and then updates the essay based on the feedback.

## Features

- **Essay Generation**: Uses an AI model to generate essays based on prompts
- **AI Review**: A different AI model reviews the generated essay and provides feedback
- **Essay Updates**: The original model incorporates feedback to improve the essay
- **Markdown Export**: All three steps (essay, feedback, updated essay) are saved as markdown files
- **Automatic Retry Logic**: Exponential backoff retry mechanism for handling transient API errors
- **Type-Safe**: Fully typed with TypeScript for better development experience

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create a `.env` file in the root directory with the following variables:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
ESSAY_MODEL=openai/gpt-4-turbo-preview
REVIEW_MODEL=anthropic/claude-3-opus

# Retry Configuration (optional)
DEFAULT_RETRY_DELAY=10000  # Initial retry delay in milliseconds (default: 10 seconds)
RETRY_ATTEMPTS=5           # Maximum number of retry attempts (default: 5)
```

You can copy the `.env.example` file as a starting point:
```bash
cp .env.example .env
```

3. Build the project (optional, bun can run TypeScript directly):
```bash
bun run build
```

## Usage

### Development Mode
```bash
bun run dev "Your essay prompt here"
```

### Production Mode
```bash
bun start "Your essay prompt here"
```

## Output

All generated files are saved in the `output/` directory:
- `essay-[timestamp].md` - The original generated essay
- `feedback-[timestamp].md` - The review feedback
- `essay-updated-[timestamp].md` - The updated essay incorporating feedback

## Technology Stack

- **Vercel AI SDK** (v5.0.107): For AI model interactions using the latest V2 model specification
- **OpenRouter AI SDK Provider** (@openrouter/ai-sdk-provider): For accessing 300+ language models through OpenRouter
- **TypeScript**: For type-safe code with strict type checking
- **Bun**: Runtime environment and package manager (faster than Node.js for this use case)
- **dotenv**: For environment variable management

## Project Structure

```
essay-test-cursor/
├── src/
│   ├── config.ts              # Configuration and environment variable handling
│   ├── index.ts               # Main entry point and workflow orchestration
│   ├── services/
│   │   └── essayService.ts    # Essay generation, review, and update logic
│   └── utils/
│       ├── fileUtils.ts       # Markdown file saving utilities
│       └── retry.ts          # Exponential backoff retry logic
├── output/                    # Generated markdown files (created automatically)
├── .env.example              # Example environment configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Configuration

### Model Configuration

You can configure which models to use for essay generation and review by setting the `ESSAY_MODEL` and `REVIEW_MODEL` environment variables. These should be valid OpenRouter model identifiers.

Examples:
- `tngtech/deepseek-r1t2-chimera:free`
- `nousresearch/hermes-3-llama-3.1-405b:free`
- `openai/gpt-4-turbo-preview`
- `anthropic/claude-3-opus`
- `google/gemini-pro`
- `meta-llama/llama-3-70b-instruct`

See [OpenRouter's model list](https://openrouter.ai/models) for available models.

### Retry Configuration

The application includes automatic retry logic with exponential backoff to handle transient API errors. You can configure this behavior via environment variables:

- **`DEFAULT_RETRY_DELAY`** (default: `10000`): Initial delay between retries in milliseconds (10 seconds). This delay doubles with each retry attempt.
- **`RETRY_ATTEMPTS`** (default: `5`): Maximum number of retry attempts before giving up.

**Retry Behavior:**
- The delay increases exponentially: 10s → 20s → 40s → 45s (capped) → 45s (capped)
- Maximum delay is capped at 45 seconds regardless of configuration
- All OpenRouter API calls (essay generation, review, and update) use the same retry logic
- Retry attempts are logged to the console with timing information

Example retry sequence:
1. First attempt fails → wait 10 seconds
2. Second attempt fails → wait 20 seconds
3. Third attempt fails → wait 40 seconds
4. Fourth attempt fails → wait 45 seconds (capped)
5. Fifth attempt fails → wait 45 seconds (capped)
6. If all attempts fail → error is thrown

## Error Handling

The application automatically retries failed API calls with exponential backoff. If all retry attempts are exhausted, the workflow will stop and display an error message. Check your OpenRouter API key, model availability, and network connection if you encounter persistent errors.

