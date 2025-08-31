# LangChain Logging Utilities

Professional logging utilities for LangChain applications with human-friendly markdown output.

## Features

- 📝 **Human-readable markdown logs** with timestamps and emojis
- 🔍 **Comprehensive execution tracing** of chains, agents, LLMs, and tools
- 📊 **Performance metrics** with session duration and token usage
- 🎯 **Configurable logging levels** (console, markdown, LangSmith)
- 🏗️ **Professional architecture** with proper separation of concerns

## Quick Start

### Basic Usage

```javascript
import { setupLangChainLogging } from "./langchainLogger.js";
import { ChatOpenAI } from "@langchain/openai";

// Setup logging for your service
const { handlers, markdownHandler } = setupLangChainLogging(
  "Your Service Name",
  {
    enableLangSmith: true,
    enableConsole: true,
    enableMarkdown: true,
  }
);

// Create your model
const model = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0,
  verbose: true,
});

// Use with any LangChain component
const result = await model.invoke("Hello world", {
  callbacks: handlers,
});

// Don't forget to finalize the session
if (markdownHandler) {
  markdownHandler.finalize();
}
```

### Advanced Usage with Request Details

```javascript
export async function myLangChainService(requestData) {
  // Create session-specific logging
  const { handlers, markdownHandler } = setupLangChainLogging("My Service");

  // Log request details
  if (markdownHandler) {
    markdownHandler.logRequestDetails(requestData.query, requestData.userData);
  }

  try {
    // Your LangChain operations
    const model = new ChatOpenAI({ verbose: true });
    const result = await model.invoke(requestData.query, {
      callbacks: handlers,
    });

    return result;
  } finally {
    // Always finalize the session
    if (markdownHandler) {
      const sessionInfo = markdownHandler.finalize();
      console.log(`Session completed: ${sessionInfo.duration}ms`);
    }
  }
}
```

## Configuration Options

```javascript
const options = {
  enableLangSmith: true, // Enable LangSmith tracing
  enableConsole: true, // Enable console output
  enableMarkdown: true, // Enable markdown file logging
  serviceName: "My Service", // Service name for logs
  logsDir: "./custom-logs", // Custom logs directory
  modelConfig: {
    // Default model configuration
    modelName: "gpt-4o",
    temperature: 0,
    verbose: true,
  },
};
```

## Log File Structure

Generated markdown files include:

- **Session metadata** (ID, timestamps, service name)
- **Request details** (query, user data)
- **Chain execution** (starts/ends with inputs/outputs)
- **LLM interactions** (prompts, responses, token usage)
- **Agent reasoning** (actions, tool selections)
- **Tool executions** (inputs, outputs, errors)
- **Performance metrics** (duration, timestamps)

## Best Practices

1. **Create handlers per request** for better isolation
2. **Always finalize sessions** to complete logs
3. **Use descriptive service names** for easy identification
4. **Handle errors gracefully** in finalization blocks
5. **Configure based on environment** (disable verbose in production)

## Example Log Output

````markdown
# LangChain My Service Session Log

**Session ID:** 1756637240746  
**Started:** 2025-08-31T10:47:20.746Z  
**Service:** My Service

---

## 📋 Request Details

**Query:** Find restaurants in Santa Monica
**User:** Jane Smith

## Step 1: Chain Start - AgentExecutor

**Time:** 2025-08-31T10:47:20.761Z  
**Inputs:** ```json
{
"input": "Find restaurants in Santa Monica",
"user_profile": "Jane Smith..."
}
````

### 🤖 Agent Action

**Tool:** google_places  
**Input:** "restaurant Santa Monica"

### 🔧 Tool Start - GooglePlacesAPI

**Input:** restaurant Santa Monica

### ✅ Tool Complete

**Output:** [{"name": "Tar & Roses"...}]

---

**Session Completed:** 2025-08-31T10:47:25.123Z  
**Total Duration:** 4377ms

````

## Migration from Old Logging

Replace old inline logging code with the utility:

```javascript
// Old way ❌
const markdownHandler = new MarkdownCallbackHandler();
// ... lots of inline logging code

// New way ✅
const { handlers, markdownHandler } = setupLangChainLogging("Service Name");
````

This provides better:

- **Separation of concerns**
- **Reusability across services**
- **Consistent logging format**
- **Easier maintenance**
- **Professional code organization**
