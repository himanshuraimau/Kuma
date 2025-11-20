# Install LangChain

To install the LangChain package:

<CodeGroup>
  ```bash npm theme={null}
  npm install langchain @langchain/core
  ```

  ```bash pnpm theme={null}
  pnpm add langchain @langchain/core
  ```

  ```bash yarn theme={null}
  yarn add langchain @langchain/core
  ```

  ```bash bun theme={null}
  bun add langchain @langchain/core
  ```
</CodeGroup>

LangChain provides integrations to hundreds of LLMs and thousands of other integrations. These live in independent provider packages. For example:

<CodeGroup>
  ```bash npm theme={null}
  # Installing the OpenAI integration
  npm install @langchain/openai
  # Installing the Anthropic integration
  npm install @langchain/anthropic
  ```

  ```bash pnpm theme={null}
  # Installing the OpenAI integration
  pnpm install @langchain/openai
  # Installing the Anthropic integration
  pnpm install @langchain/anthropic
  ```

  ```bash yarn theme={null}
  # Installing the OpenAI integration
  yarn add @langchain/openai
  # Installing the Anthropic integration
  yarn add @langchain/anthropic
  ```

  ```bash bun theme={null}
  # Installing the OpenAI integration
  bun add @langchain/openai
  # Installing the Anthropic integration
  bun add @langchain/anthropic
  ```
</CodeGroup>

<Tip>
  See the [Integrations tab](/oss/javascript/integrations/providers/overview) for a full list of available integrations.
</Tip>

***

<Callout icon="pen-to-square" iconType="regular">
  [Edit the source of this page on GitHub.](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/install.mdx)
</Callout>

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Tip>


# Quickstart

This quickstart takes you from a simple setup to a fully functional AI agent in just a few minutes.

## Build a basic agent

Start by creating a simple agent that can answer questions and call tools. The agent will use Claude Sonnet 4.5 as its language model, a basic weather function as a tool, and a simple prompt to guide its behavior.

<Info>
  For this example, you will need to set up a [Claude (Anthropic)](https://www.anthropic.com/) account and get an API key. Then, set the `ANTHROPIC_API_KEY` environment variable in your terminal.
</Info>

```ts  theme={null}
import { createAgent, tool } from "langchain";
import * as z from "zod";

const getWeather = tool(
  (input) => `It's always sunny in ${input.city}!`,
  {
    name: "get_weather",
    description: "Get the weather for a given city",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-5-20250929",
  tools: [getWeather],
});

console.log(
  await agent.invoke({
    messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  })
);
```

<Tip>
  To learn how to trace your agent with LangSmith, see the [LangSmith documentation](/langsmith/trace-with-langchain).
</Tip>

## Build a real-world agent

Next, build a practical weather forecasting agent that demonstrates key production concepts:

1. **Detailed system prompts** for better agent behavior
2. **Create tools** that integrate with external data
3. **Model configuration** for consistent responses
4. **Structured output** for predictable results
5. **Conversational memory** for chat-like interactions
6. **Create and run the agent** create a fully functional agent

Let's walk through each step:

<Steps>
  <Step title="Define the system prompt">
    The system prompt defines your agent’s role and behavior. Keep it specific and actionable:

    ```ts  theme={null}
    const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

    You have access to two tools:

    - get_weather_for_location: use this to get the weather for a specific location
    - get_user_location: use this to get the user's location

    If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;
    ```
  </Step>

  <Step title="Create tools">
    [Tools](/oss/javascript/langchain/tools) are functions your agent can call. Oftentimes tools will want to connect to external systems, and will rely on runtime configuration to do so. Notice here how the `getUserLocation` tool does exactly that:

    ```ts  theme={null}
    import { type Runtime } from "@langchain/langgraph";
    import { tool } from "langchain";
    import * as z from "zod";

    const getWeather = tool(
      (input) => `It's always sunny in ${input.city}!`,
      {
        name: "get_weather_for_location",
        description: "Get the weather for a given city",
        schema: z.object({
          city: z.string().describe("The city to get the weather for"),
        }),
      }
    );

    type AgentRuntime = Runtime<{ user_id: string }>;

    const getUserLocation = tool(
      (_, config: AgentRuntime) => {
        const { user_id } = config.context;
        return user_id === "1" ? "Florida" : "SF";
      },
      {
        name: "get_user_location",
        description: "Retrieve user information based on user ID",
      }
    );
    ```

    <Note>
      [Zod](https://zod.dev/) is a library for validating and parsing pre-defined schemas. You can use it to define the input schema for your tools to make sure the agent only calls the tool with the correct arguments.

      Alternatively, you can define the `schema` property as a [JSON schema](https://json-schema.org/overview/what-is-jsonschema) object. Keep in mind that JSON schemas **won't** be validated at runtime.

      <Accordion title="Example: Using JSON schema for tool input">
        ```ts  theme={null}
        const getWeather = tool(
          ({ city }) => `It's always sunny in ${city}!`,
          {
            name: "get_weather_for_location",
            description: "Get the weather for a given city",
            schema: {
              type: "object",
              properties: {
                city: {
                  type: "string",
                  description: "The city to get the weather for"
                }
              },
              required: ["city"]
            },
          }
        );
        ```
      </Accordion>
    </Note>
  </Step>

  <Step title="Configure your model">
    Set up your [language model](/oss/javascript/langchain/models) with the right [parameters](/oss/javascript/langchain/models#parameters) for your use case:

    ```ts  theme={null}
    import { initChatModel } from "langchain";

    const model = await initChatModel(
      "claude-sonnet-4-5-20250929",
      { temperature: 0.5, timeout: 10, maxTokens: 1000 }
    );
    ```
  </Step>

  <Step title="Define response format">
    Optionally, define a structured response format if you need the agent responses to match
    a specific schema.

    ```ts  theme={null}
    const responseFormat = z.object({
      punny_response: z.string(),
      weather_conditions: z.string().optional(),
    });
    ```
  </Step>

  <Step title="Add memory">
    Add [memory](/oss/javascript/langchain/short-term-memory) to your agent to maintain state across interactions. This allows
    the agent to remember previous conversations and context.

    ```ts  theme={null}
    import { MemorySaver } from "@langchain/langgraph";

    const checkpointer = new MemorySaver();
    ```

    <Info>
      In production, use a persistent checkpointer that saves to a database.
      See [Add and manage memory](/oss/javascript/langgraph/add-memory#manage-short-term-memory) for more details.
    </Info>
  </Step>

  <Step title="Create and run the agent">
    Now assemble your agent with all the components and run it!

    ```ts  theme={null}
    import { createAgent } from "langchain";

    const agent = createAgent({
      model: "claude-sonnet-4-5-20250929",
      systemPrompt: systemPrompt,
      tools: [getUserLocation, getWeather],
      responseFormat,
      checkpointer,
    });

    // `thread_id` is a unique identifier for a given conversation.
    const config = {
      configurable: { thread_id: "1" },
      context: { user_id: "1" },
    };

    const response = await agent.invoke(
      { messages: [{ role: "user", content: "what is the weather outside?" }] },
      config
    );
    console.log(response.structuredResponse);
    // {
    //   punny_response: "Florida is still having a 'sun-derful' day ...",
    //   weather_conditions: "It's always sunny in Florida!"
    // }

    // Note that we can continue the conversation using the same `thread_id`.
    const thankYouResponse = await agent.invoke(
      { messages: [{ role: "user", content: "thank you!" }] },
      config
    );
    console.log(thankYouResponse.structuredResponse);
    // {
    //   punny_response: "You're 'thund-erfully' welcome! ...",
    //   weather_conditions: undefined
    // }
    ```
  </Step>
</Steps>

<Expandable title="Full example code">
  ```ts  theme={null}
  import { createAgent, tool, initChatModel } from "langchain";
  import { MemorySaver, type Runtime } from "@langchain/langgraph";
  import * as z from "zod";

  // Define system prompt
  const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

  You have access to two tools:

  - get_weather_for_location: use this to get the weather for a specific location
  - get_user_location: use this to get the user's location

  If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`;

  // Define tools
  const getWeather = tool(
    ({ city }) => `It's always sunny in ${city}!`,
    {
      name: "get_weather_for_location",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string(),
      }),
    }
  );

  const getUserLocation = tool(
    (_, config: Runtime<{ user_id: string}>) => {
      const { user_id } = config.context;
      return user_id === "1" ? "Florida" : "SF";
    },
    {
      name: "get_user_location",
      description: "Retrieve user information based on user ID",
      schema: z.object({}),
    }
  );

  // Configure model
  const model = await initChatModel(
    "claude-sonnet-4-5-20250929",
    { temperature: 0 }
  );

  // Define response format
  const responseFormat = z.object({
    punny_response: z.string(),
    weather_conditions: z.string().optional(),
  });

  // Set up memory
  const checkpointer = new MemorySaver();

  // Create agent
  const agent = createAgent({
    model: "claude-sonnet-4-5-20250929",
    systemPrompt: systemPrompt,
    tools: [getUserLocation, getWeather],
    responseFormat,
    checkpointer,
  });

  // Run agent
  // `thread_id` is a unique identifier for a given conversation.
  const config = {
    configurable: { thread_id: "1" },
    context: { user_id: "1" },
  };

  const response = await agent.invoke(
    { messages: [{ role: "user", content: "what is the weather outside?" }] },
    config
  );
  console.log(response.structuredResponse);
  // {
  //   punny_response: "Florida is still having a 'sun-derful' day! The sunshine is playing 'ray-dio' hits all day long! I'd say it's the perfect weather for some 'solar-bration'! If you were hoping for rain, I'm afraid that idea is all 'washed up' - the forecast remains 'clear-ly' brilliant!",
  //   weather_conditions: "It's always sunny in Florida!"
  // }

  // Note that we can continue the conversation using the same `thread_id`.
  const thankYouResponse = await agent.invoke(
    { messages: [{ role: "user", content: "thank you!" }] },
    config
  );
  console.log(thankYouResponse.structuredResponse);
  // {
  //   punny_response: "You're 'thund-erfully' welcome! It's always a 'breeze' to help you stay 'current' with the weather. I'm just 'cloud'-ing around waiting to 'shower' you with more forecasts whenever you need them. Have a 'sun-sational' day in the Florida sunshine!",
  //   weather_conditions: undefined
  // }
  ```
</Expandable>

<Tip>
  To learn how to trace your agent with LangSmith, see the [LangSmith documentation](/langsmith/trace-with-langchain).
</Tip>

Congratulations! You now have an AI agent that can:

* **Understand context** and remember conversations
* **Use multiple tools** intelligently
* **Provide structured responses** in a consistent format
* **Handle user-specific information** through context
* **Maintain conversation state** across interactions

***

<Callout icon="pen-to-square" iconType="regular">
  [Edit the source of this page on GitHub.](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/quickstart.mdx)
</Callout>

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Tip>


# Structured output

Structured output allows agents to return data in a specific, predictable format. Instead of parsing natural language responses, you get typed structured data.

LangChain's prebuilt ReAct agent `createAgent` handles structured output automatically. The user sets their desired structured output schema, and when the model generates the structured data, it's captured, validated, and returned in the `structuredResponse` key of the agent's state.

```ts  theme={null}
type ResponseFormat = (
    | ZodSchema<StructuredResponseT> // a Zod schema
    | Record<string, unknown> // a JSON Schema
)

const agent = createAgent({
    // ...
    responseFormat: ResponseFormat | ResponseFormat[]
})
```

## Response Format

Controls how the agent returns structured data. You can provide either a Zod object or JSON schema. By default, the agent uses a tool calling strategy, in which the output is created by an additional tool call. Certain models support native structured output, in which case the agent will use that strategy instead.

You can control the behavior by wrapping `ResponseFormat` in a `toolStrategy` or `providerStrategy` function call:

```ts  theme={null}
import { toolStrategy, providerStrategy } from "langchain";

const agent = createAgent({
    // use a provider strategy if supported by the model
    responseFormat: providerStrategy(z.object({ ... }))
    // or enforce a tool strategy
    responseFormat: toolStrategy(z.object({ ... }))
})
```

The structured response is returned in the `structuredResponse` key of the agent's final state.

## Provider strategy

Some model providers support structured output natively through their APIs (e.g. OpenAI, Grok, Gemini). This is the most reliable method when available.

To use this strategy, configure a `ProviderStrategy`:

```ts  theme={null}
function providerStrategy<StructuredResponseT>(
    schema: ZodSchema<StructuredResponseT> | JsonSchemaFormat
): ProviderStrategy<StructuredResponseT>
```

<ParamField path="schema" required>
  The schema defining the structured output format. Supports:

  * **Zod Schema**: A zod schema
  * **JSON Schema**: A JSON schema object
</ParamField>

LangChain automatically uses `ProviderStrategy` when you pass a schema type directly to `createAgent.responseFormat` and the model supports native structured output:

<CodeGroup>
  ```ts Zod Schema theme={null}
  import * as z from "zod";
  import { createAgent, providerStrategy } from "langchain";

  const ContactInfo = z.object({
      name: z.string().describe("The name of the person"),
      email: z.string().describe("The email address of the person"),
      phone: z.string().describe("The phone number of the person"),
  });

  const agent = createAgent({
      model: "gpt-5",
      tools: [],
      responseFormat: providerStrategy(ContactInfo)
  });

  const result = await agent.invoke({
      messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  });

  console.log(result.structuredResponse);
  // { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" }
  ```

  ```ts JSON Schema theme={null}
  import { createAgent, providerStrategy } from "langchain";

  const contactInfoSchema = {
      "type": "object",
      "description": "Contact information for a person.",
      "properties": {
          "name": {"type": "string", "description": "The name of the person"},
          "email": {"type": "string", "description": "The email address of the person"},
          "phone": {"type": "string", "description": "The phone number of the person"}
      },
      "required": ["name", "email", "phone"]
  }

  const agent = createAgent({
      model: "gpt-5",
      tools: [],
      responseFormat: providerStrategy(contactInfoSchema)
  });

  const result = await agent.invoke({
      messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
  });

  console.log(result.structuredResponse);
  // { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" }
  ```
</CodeGroup>

Provider-native structured output provides high reliability and strict validation because the model provider enforces the schema. Use it when available.

<Note>
  If the provider natively supports structured output for your model choice, it is functionally equivalent to write `responseFormat: contactInfoSchema` instead of `responseFormat: toolStrategy(contactInfoSchema)`. In either case, if structured output is not supported, the agent will fall back to a tool calling strategy.
</Note>

## Tool calling strategy

For models that don't support native structured output, LangChain uses tool calling to achieve the same result. This works with all models that support tool calling, which is most modern models.

To use this strategy, configure a `ToolStrategy`:

```ts  theme={null}
function toolStrategy<StructuredResponseT>(
    responseFormat:
        | JsonSchemaFormat
        | ZodSchema<StructuredResponseT>
        | (ZodSchema<StructuredResponseT> | JsonSchemaFormat)[]
    options?: ToolStrategyOptions
): ToolStrategy<StructuredResponseT>
```

<ParamField path="schema" required>
  The schema defining the structured output format. Supports:

  * **Zod Schema**: A zod schema
  * **JSON Schema**: A JSON schema object
</ParamField>

<ParamField path="options.toolMessageContent">
  Custom content for the tool message returned when structured output is generated.
  If not provided, defaults to a message showing the structured response data.
</ParamField>

<ParamField path="options.handleError">
  Options parameter containing an optional `handleError` parameter for customizing the error handling strategy.

  * **`true`**: Catch all errors with default error template (default)
  * **`False`**: No retry, let exceptions propagate
  * **`(error: ToolStrategyError) => string | Promise<string>`**: retry with the provided message or throw the error
</ParamField>

<CodeGroup>
  ```ts Zod Schema theme={null}
  import * as z from "zod";
  import { createAgent, toolStrategy } from "langchain";

  const ProductReview = z.object({
      rating: z.number().min(1).max(5).optional(),
      sentiment: z.enum(["positive", "negative"]),
      keyPoints: z.array(z.string()).describe("The key points of the review. Lowercase, 1-3 words each."),
  });

  const agent = createAgent({
      model: "gpt-5",
      tools: [],
      responseFormat: toolStrategy(ProductReview)
  })

  const result = await agent.invoke({
      "messages": [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })

  console.log(result.structuredResponse);
  // { "rating": 5, "sentiment": "positive", "keyPoints": ["fast shipping", "expensive"] }
  ```

  ```ts JSON Schema theme={null}
  import { createAgent, toolStrategy } from "langchain";

  const productReviewSchema = {
      "type": "object",
      "description": "Analysis of a product review.",
      "properties": {
          "rating": {
              "type": ["integer", "null"],
              "description": "The rating of the product (1-5)",
              "minimum": 1,
              "maximum": 5
          },
          "sentiment": {
              "type": "string",
              "enum": ["positive", "negative"],
              "description": "The sentiment of the review"
          },
          "key_points": {
              "type": "array",
              "items": {"type": "string"},
              "description": "The key points of the review"
          }
      },
      "required": ["sentiment", "key_points"]
  }

  const agent = createAgent({
      model: "gpt-5",
      tools: [],
      responseFormat: toolStrategy(productReviewSchema)
  });

  const result = await agent.invoke({
      messages: [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })

  console.log(result.structuredResponse);
  // { "rating": 5, "sentiment": "positive", "keyPoints": ["fast shipping", "expensive"] }
  ```

  ```ts Union Types theme={null}
  import * as z from "zod";
  import { createAgent, toolStrategy } from "langchain";

  const ProductReview = z.object({
      rating: z.number().min(1).max(5).optional(),
      sentiment: z.enum(["positive", "negative"]),
      keyPoints: z.array(z.string()).describe("The key points of the review. Lowercase, 1-3 words each."),
  });

  const CustomerComplaint = z.object({
      issueType: z.enum(["product", "service", "shipping", "billing"]),
      severity: z.enum(["low", "medium", "high"]),
      description: z.string().describe("Brief description of the complaint"),
  });

  const agent = createAgent({
      model: "gpt-5",
      tools: [],
      responseFormat: toolStrategy([ProductReview, CustomerComplaint])
  });

  const result = await agent.invoke({
      messages: [{"role": "user", "content": "Analyze this review: 'Great product: 5 out of 5 stars. Fast shipping, but expensive'"}]
  })

  console.log(result.structuredResponse);
  // { "rating": 5, "sentiment": "positive", "keyPoints": ["fast shipping", "expensive"] }
  ```
</CodeGroup>

### Custom tool message content

The `toolMessageContent` parameter allows you to customize the message that appears in the conversation history when structured output is generated:

```ts  theme={null}
import * as z from "zod";
import { createAgent, toolStrategy } from "langchain";

const MeetingAction = z.object({
    task: z.string().describe("The specific task to be completed"),
    assignee: z.string().describe("Person responsible for the task"),
    priority: z.enum(["low", "medium", "high"]).describe("Priority level"),
});

const agent = createAgent({
    model: "gpt-5",
    tools: [],
    responseFormat: toolStrategy(MeetingAction, {
        toolMessageContent: "Action item captured and added to meeting notes!"
    })
});

const result = await agent.invoke({
    messages: [{"role": "user", "content": "From our meeting: Sarah needs to update the project timeline as soon as possible"}]
});

console.log(result);
/**
 * {
 *   messages: [
 *     { role: "user", content: "From our meeting: Sarah needs to update the project timeline as soon as possible" },
 *     { role: "assistant", content: "Action item captured and added to meeting notes!", tool_calls: [ { name: "MeetingAction", args: { task: "update the project timeline", assignee: "Sarah", priority: "high" }, id: "call_456" } ] },
 *     { role: "tool", content: "Action item captured and added to meeting notes!", tool_call_id: "call_456", name: "MeetingAction" }
 *   ],
 *   structuredResponse: { task: "update the project timeline", assignee: "Sarah", priority: "high" }
 * }
 */
```

Without `toolMessageContent`, we'd see:

```ts  theme={null}
# console.log(result);
/**
 * {
 *   messages: [
 *     ...
 *     { role: "tool", content: "Returning structured response: {'task': 'update the project timeline', 'assignee': 'Sarah', 'priority': 'high'}", tool_call_id: "call_456", name: "MeetingAction" }
 *   ],
 *   structuredResponse: { task: "update the project timeline", assignee: "Sarah", priority: "high" }
 * }
 */
```

### Error handling

Models can make mistakes when generating structured output via tool calling. LangChain provides intelligent retry mechanisms to handle these errors automatically.

#### Multiple structured outputs error

When a model incorrectly calls multiple structured output tools, the agent provides error feedback in a @\[`ToolMessage`] and prompts the model to retry:

```ts  theme={null}
import * as z from "zod";
import { createAgent, toolStrategy } from "langchain";

const ContactInfo = z.object({
    name: z.string().describe("Person's name"),
    email: z.string().describe("Email address"),
});

const EventDetails = z.object({
    event_name: z.string().describe("Name of the event"),
    date: z.string().describe("Event date"),
});

const agent = createAgent({
    model: "gpt-5",
    tools: [],
    responseFormat: toolStrategy([ContactInfo, EventDetails]),
});

const result = await agent.invoke({
    messages: [
        {
        role: "user",
        content:
            "Extract info: John Doe (john@email.com) is organizing Tech Conference on March 15th",
        },
    ],
});

console.log(result);

/**
 * {
 *   messages: [
 *     { role: "user", content: "Extract info: John Doe (john@email.com) is organizing Tech Conference on March 15th" },
 *     { role: "assistant", content: "", tool_calls: [ { name: "ContactInfo", args: { name: "John Doe", email: "john@email.com" }, id: "call_1" }, { name: "EventDetails", args: { event_name: "Tech Conference", date: "March 15th" }, id: "call_2" } ] },
 *     { role: "tool", content: "Error: Model incorrectly returned multiple structured responses (ContactInfo, EventDetails) when only one is expected.\n Please fix your mistakes.", tool_call_id: "call_1", name: "ContactInfo" },
 *     { role: "tool", content: "Error: Model incorrectly returned multiple structured responses (ContactInfo, EventDetails) when only one is expected.\n Please fix your mistakes.", tool_call_id: "call_2", name: "EventDetails" },
 *     { role: "assistant", content: "", tool_calls: [ { name: "ContactInfo", args: { name: "John Doe", email: "john@email.com" }, id: "call_3" } ] },
 *     { role: "tool", content: "Returning structured response: {'name': 'John Doe', 'email': 'john@email.com'}", tool_call_id: "call_3", name: "ContactInfo" }
 *   ],
 *   structuredResponse: { name: "John Doe", email: "john@email.com" }
 * }
 */
```

#### Schema validation error

When structured output doesn't match the expected schema, the agent provides specific error feedback:

```ts  theme={null}
import * as z from "zod";
import { createAgent, toolStrategy } from "langchain";

const ProductRating = z.object({
    rating: z.number().min(1).max(5).describe("Rating from 1-5"),
    comment: z.string().describe("Review comment"),
});

const agent = createAgent({
    model: "gpt-5",
    tools: [],
    responseFormat: toolStrategy(ProductRating),
});

const result = await agent.invoke({
    messages: [
        {
        role: "user",
        content: "Parse this: Amazing product, 10/10!",
        },
    ],
});

console.log(result);

/**
 * {
 *   messages: [
 *     { role: "user", content: "Parse this: Amazing product, 10/10!" },
 *     { role: "assistant", content: "", tool_calls: [ { name: "ProductRating", args: { rating: 10, comment: "Amazing product" }, id: "call_1" } ] },
 *     { role: "tool", content: "Error: Failed to parse structured output for tool 'ProductRating': 1 validation error for ProductRating\nrating\n  Input should be less than or equal to 5 [type=less_than_equal, input_value=10, input_type=int].\n Please fix your mistakes.", tool_call_id: "call_1", name: "ProductRating" },
 *     { role: "assistant", content: "", tool_calls: [ { name: "ProductRating", args: { rating: 5, comment: "Amazing product" }, id: "call_2" } ] },
 *     { role: "tool", content: "Returning structured response: {'rating': 5, 'comment': 'Amazing product'}", tool_call_id: "call_2", name: "ProductRating" }
 *   ],
 *   structuredResponse: { rating: 5, comment: "Amazing product" }
 * }
 */
```

#### Error handling strategies

You can customize how errors are handled using the `handleErrors` parameter:

**Custom error message:**

```ts  theme={null}
const responseFormat = toolStrategy(ProductRating, {
    handleError: "Please provide a valid rating between 1-5 and include a comment."
)

// Error message becomes:
// { role: "tool", content: "Please provide a valid rating between 1-5 and include a comment." }
```

**Handle specific exceptions only:**

```ts  theme={null}
import { ToolInputParsingException } from "@langchain/core/tools";

const responseFormat = toolStrategy(ProductRating, {
    handleError: (error: ToolStrategyError) => {
        if (error instanceof ToolInputParsingException) {
        return "Please provide a valid rating between 1-5 and include a comment.";
        }
        return error.message;
    }
)

// Only validation errors get retried with default message:
// { role: "tool", content: "Error: Failed to parse structured output for tool 'ProductRating': ...\n Please fix your mistakes." }
```

**Handle multiple exception types:**

```ts  theme={null}
const responseFormat = toolStrategy(ProductRating, {
    handleError: (error: ToolStrategyError) => {
        if (error instanceof ToolInputParsingException) {
        return "Please provide a valid rating between 1-5 and include a comment.";
        }
        if (error instanceof CustomUserError) {
        return "This is a custom user error.";
        }
        return error.message;
    }
)
```

**No error handling:**

```ts  theme={null}
const responseFormat = toolStrategy(ProductRating, {
    handleError: false  // All errors raised
)
```

***

<Callout icon="pen-to-square" iconType="regular">
  [Edit the source of this page on GitHub.](https://github.com/langchain-ai/docs/edit/main/src/oss/langchain/structured-output.mdx)
</Callout>

<Tip icon="terminal" iconType="regular">
  [Connect these docs programmatically](/use-these-docs) to Claude, VSCode, and more via MCP for real-time answers.
</Tip>
