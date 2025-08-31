import fs from "fs";
import path from "path";
import { ConsoleCallbackHandler } from "@langchain/core/tracers/console";

/**
 * LangChain Logging Utilities
 *
 * Provides comprehensive logging capabilities for LangChain operations including:
 * - Human-friendly markdown log files
 * - Console output for real-time monitoring
 * - Detailed execution tracing
 * - Performance metrics
 */

/**
 * Custom Markdown Callback Handler for human-friendly detailed logging
 * Saves comprehensive execution logs to timestamped markdown files
 */
export class MarkdownCallbackHandler {
  constructor(serviceName = "LangChain Service", logsDir = null) {
    this.serviceName = serviceName;
    this.sessionId = Date.now();
    this.logsDir = logsDir || path.join(process.cwd(), "logs");
    this.logFile = path.join(
      this.logsDir,
      `langchain-session-${this.sessionId}.md`
    );
    this.startTime = new Date();
    this.stepCounter = 0;

    // Ensure logs directory exists
    this.ensureLogsDirectory();
    this.initializeLogFile();

    // Bind all methods to ensure 'this' context is preserved
    this.handleChainStart = this.handleChainStart.bind(this);
    this.handleChainEnd = this.handleChainEnd.bind(this);
    this.handleLLMStart = this.handleLLMStart.bind(this);
    this.handleLLMEnd = this.handleLLMEnd.bind(this);
    this.handleAgentAction = this.handleAgentAction.bind(this);
    this.handleAgentEnd = this.handleAgentEnd.bind(this);
    this.handleToolStart = this.handleToolStart.bind(this);
    this.handleToolEnd = this.handleToolEnd.bind(this);
    this.handleToolError = this.handleToolError.bind(this);
  }

  ensureLogsDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  initializeLogFile() {
    const header = `# LangChain ${this.serviceName} Session Log

**Session ID:** ${this.sessionId}  
**Started:** ${this.startTime.toISOString()}  
**Service:** ${this.serviceName}

---

`;
    fs.writeFileSync(this.logFile, header);
  }

  appendToLog(content) {
    fs.appendFileSync(this.logFile, content + "\n");
  }

  logRequestDetails(query, userData) {
    this.appendToLog(`## 📋 Request Details`);
    this.appendToLog(`**Query:** ${query}`);
    this.appendToLog(`**User:** ${userData?.name || "Unknown User"}`);
    this.appendToLog(
      `**User Data:** \`\`\`json\n${JSON.stringify(userData, null, 2)}\n\`\`\``
    );
    this.appendToLog("");
  }

  async handleChainStart(chain, inputs, runId) {
    this.stepCounter++;
    const timestamp = new Date().toISOString();
    this.appendToLog(
      `## Step ${this.stepCounter}: Chain Start - ${
        chain.constructor.name || "Unknown Chain"
      }`
    );
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(
      `**Inputs:** \`\`\`json\n${JSON.stringify(inputs, null, 2)}\n\`\`\``
    );
    this.appendToLog("");
  }

  async handleChainEnd(outputs, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### ✅ Chain Complete`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(
      `**Outputs:** \`\`\`json\n${JSON.stringify(outputs, null, 2)}\n\`\`\``
    );
    this.appendToLog("");
  }

  async handleLLMStart(llm, prompts, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### 🧠 LLM Start - ${llm.modelName || "Unknown Model"}`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(
      `**Prompts:** \`\`\`\n${
        Array.isArray(prompts) ? prompts.join("\n---\n") : prompts
      }\n\`\`\``
    );
    this.appendToLog("");
  }

  async handleLLMEnd(output, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### ✅ LLM Complete`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);

    if (output.generations && output.generations.length > 0) {
      this.appendToLog(
        `**Response:** \`\`\`\n${output.generations[0][0].text}\n\`\`\``
      );
    }

    if (output.llmOutput && output.llmOutput.tokenUsage) {
      this.appendToLog(
        `**Token Usage:** ${JSON.stringify(
          output.llmOutput.tokenUsage,
          null,
          2
        )}`
      );
    }
    this.appendToLog("");
  }

  async handleAgentAction(action, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### 🤖 Agent Action`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(`**Tool:** ${action.tool}  `);
    this.appendToLog(
      `**Input:** \`\`\`json\n${JSON.stringify(
        action.toolInput,
        null,
        2
      )}\n\`\`\``
    );
    if (action.log) {
      this.appendToLog(`**Reasoning:** \`\`\`\n${action.log}\n\`\`\``);
    }
    this.appendToLog("");
  }

  async handleAgentEnd(finish, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### 🏁 Agent Finish`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(
      `**Final Output:** \`\`\`\n${
        finish.returnValues.output ||
        JSON.stringify(finish.returnValues, null, 2)
      }\n\`\`\``
    );
    this.appendToLog("");
  }

  async handleToolStart(tool, input, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### 🔧 Tool Start - ${tool.name || "Unknown Tool"}`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(`**Input:** \`${input}\``);
    this.appendToLog("");
  }

  async handleToolEnd(output, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### ✅ Tool Complete`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);

    // Format output based on type
    if (typeof output === "string") {
      this.appendToLog(
        `**Output:** \`\`\`\n${output.substring(0, 500)}${
          output.length > 500 ? "...\n[Output truncated]" : ""
        }\n\`\`\``
      );
    } else {
      this.appendToLog(
        `**Output:** \`\`\`json\n${JSON.stringify(output, null, 2)}\n\`\`\``
      );
    }
    this.appendToLog("");
  }

  async handleToolError(error, runId) {
    const timestamp = new Date().toISOString();
    this.appendToLog(`### ❌ Tool Error`);
    this.appendToLog(`**Time:** ${timestamp}  `);
    this.appendToLog(`**Run ID:** ${runId}  `);
    this.appendToLog(`**Error:** \`\`\`\n${error.message}\n\`\`\``);
    this.appendToLog("");
  }

  finalize() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    this.appendToLog(
      `---\n\n**Session Completed:** ${endTime.toISOString()}  `
    );
    this.appendToLog(`**Total Duration:** ${duration}ms  `);
    this.appendToLog(`**Log File:** \`${this.logFile}\``);

    console.log(`📝 Detailed logs saved to: ${this.logFile}`);
    console.log(`⏱️  Session duration: ${duration}ms`);

    return {
      logFile: this.logFile,
      duration,
      sessionId: this.sessionId,
    };
  }
}

/**
 * LangChain Logger Configuration
 * Sets up environment variables and creates callback handlers
 */
export class LangChainLogger {
  constructor(options = {}) {
    this.options = {
      enableLangSmith: options.enableLangSmith ?? true,
      enableConsole: options.enableConsole ?? true,
      enableMarkdown: options.enableMarkdown ?? true,
      serviceName: options.serviceName || "LangChain Service",
      logsDir: options.logsDir || null,
      ...options,
    };

    this.setupEnvironment();
  }

  setupEnvironment() {
    // Configure LangChain environment variables
    if (this.options.enableLangSmith) {
      process.env.LANGSMITH_TRACING = "true";
      process.env.LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY || "";
    } else {
      process.env.LANGSMITH_TRACING = "false";
    }

    // For non-serverless environments, enable background callbacks to reduce latency
    process.env.LANGCHAIN_CALLBACKS_BACKGROUND = "true";
  }

  createHandlers() {
    const handlers = [];

    if (this.options.enableConsole) {
      handlers.push(new ConsoleCallbackHandler());
    }

    if (this.options.enableMarkdown) {
      const markdownHandler = new MarkdownCallbackHandler(
        this.options.serviceName,
        this.options.logsDir
      );
      handlers.push(markdownHandler);

      // Return the markdown handler separately for finalization
      return { handlers, markdownHandler };
    }

    return { handlers, markdownHandler: null };
  }

  /**
   * Get model configuration for external instantiation
   */
  getModelConfig(modelConfig = {}) {
    return {
      modelName: "gpt-4o",
      temperature: 0,
      verbose: this.options.enableConsole,
      ...modelConfig,
    };
  }
}

/**
 * Factory function to create a logger instance with sensible defaults
 */
export function createLangChainLogger(serviceName, options = {}) {
  return new LangChainLogger({
    serviceName,
    ...options,
  });
}

/**
 * Quick setup function for common logging scenarios
 */
export function setupLangChainLogging(serviceName, options = {}) {
  const logger = createLangChainLogger(serviceName, options);
  const { handlers, markdownHandler } = logger.createHandlers();

  return {
    logger,
    handlers,
    markdownHandler,
    modelConfig: logger.getModelConfig(options.modelConfig),
  };
}
