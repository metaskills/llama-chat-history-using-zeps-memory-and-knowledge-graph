
# Chat History For Llama 3 with Zep's AI Memory & Knowledge Graph

https://www.unremarkable.ai/llama-chat-history-with-zeps-ai-memory-knowledge-graph/?ref=github

![Llama Chat History with Zep](images/llama-chat-history-with-zep.png)

A handful of demos exploring Knowledge Graphs with [Zep](https://www.getzep.com?ref=unremarkable.ai) and [Graphiti](https://github.com/getzep/graphiti?ref=unremarkable.ai). Learn more at [https://www.getzep.com](https://www.getzep.com=ref=unremarkable.ai).

## Setup

Run npm install and build. 

```shell
npm install
npm run build
```

Make sure you have the following environment variables needed:

- `ZEP_API_KEY` - Your [Zep's](https://help.getzep.com/projects?ref=unremarkable.ai) project API Key.
- `SAMBANOVA_API_KEY` - Your [SambaNova](https://cloud.sambanova.ai/apis?ref=unremarkable.ai) API Key.

All demos & expierments leverage the following tools:

1. Use of [Inquirer.js](https://www.npmjs.com/package/inquirer?ref=unremarkable.ai) with the CLI to prompt for user questions.
2. The [Vercel AI SDK](https://sdk.vercel.ai?ref=unremarkable.ai) is used to invoke and stream model output to the CLI.
3. Using the `Meta-Llama-3.2-3B-Instruct` model via hyper fast inference thanks to [SambaNova](https://sambanova.ai?ref=unremarkable.ai).

## Full Demo

> [!WARNING]  
> The `clean` command is DESTRUCTIVE. It will delete all users and sessions from your Zep project. Only use this command with a development or test Zeip account.

```shell
npm run clean
npm run demo
```

This demo incorporates most of the expierments below. It leverages Zep in the following ways:

1. Creates/finds a user named "Ken Collins" with an id of "1" and an email of "ken@unremarkable.ai".
2. Creates/finds a session for this user using a static id of "1".
3. Sends all "user" and "assistant" messages to `zep.memory.add` for turn-based chat storage.
4. Uses the resulting `memory.context` to seed the assistant with facts and entities in a dynamic system prompt for each turn.
5. Adds a resume in JSON format to the graph using `zep.graph.add`.

## Expierments

Enumerated demos can be called using `npm run`. For example:

```shell
npm run clean && DEBUG=1 npm run zep 6
```

A brief description of these enumerated demos are:

- 0: Unique Zep sessions per chat. Uses `zep.memory.get` for chat history messages.
- 1: Static Zep user with static user associated session. Creates or finds each. Uses `zep.memory.get` for chat history messages. 
- 2: Static Zep user with unique user associated session. Creates or finds a user. Uses `zep.memory.get` for chat history messages.
- 3: Static Zep user with static user associated session. Creates or finds each. Uses `zep.memory.get` for chat history messages and `memory.context` system prompt for in-context learning.
- 4: Learning a bit about `zep.memory.synthesizeQuestion` to start conversations.

At this point we have a good working demo of Zep as an OpenAI Assistant's API Thread replacement. We can now start to explore the graph.

- 5: Learning about `zep.graph.add` to see where it works (or not) in multi-turn conversations using a personal resume in Markdown format with the graph.
- 6: Exploring using JSON format for richer nodes in the graph and facts in system prompt.

<IMAGE-IDEA>
Showing where prompt (instructions/context(facts, entities)) and messages fit in when calling the LLM with the AI SDK.
</IMAGE-IDEA>

- 7: Exploring how to control facts and ratings in a session. Also, how to query the graph in real-time.


## Basic Chat

A baseline AI SDK chatbot with static in-memory messages array. No Zep usage.

```shell
npm run basic
```

```
✔ You: What is my name?
I don't have any information about your name. Our conversation just started...

✔ You: Hi then, my name is Ken.
Hi Ken, it's nice to meet you. Is there something I can help you with, or would you like to chat?

✔ You: I am working on a Personal AI project. Could you give me a very short idea for a use case?
That sounds like an interesting project. Here's a brief idea for a use case...
```

### With Zep 0

```shell
npm run zep0
```

Just like above but memory (messages) are stored in Zep.

### With Zep 1

```shell
npm run clean
npm run zep1
✔ You: My name is Ken.
Hello Ken. It's nice to meet you. Is there something I can help you with, or would you like to chat?
```

Now, if we exit and run the same command again:

```shell
npm run zep1
✔ You: What is my name?
Your name is Ken.
```

### With Zep 2

This would work if we changed our `getMessages` helper to use `zep.memory.getSessions` and used each session's `createdAt` to sort them in order.

```shell
npm run clean
npm run zep2
✔ You: My name is Ken.

npm run zep2
✔ You: I blog at unremarkable.ai

npm run zep2
✔ You: What is my name and what do I do?
```

### With Zep 3

Meant to simulate a restored session, for example, logging back into a chatbot after a period of time. The first question of that first session, our chatbot will not know our name. Besides messages being empty, the `memory.context` is undefined. Meaning that despite the fact we have a created user and session attached to each other, that is no pre-seeded facts and entities in the `memory.context`.

All first session chat basic baseline replies are exactly the same. However, if we quit the session and start up the chat again using `npm run zep3` and ask what is my name:

```
✔ You: What is my name?
You've already told me, Ken. Your full name is actually Ken Collins.
```

See how it knows our full name now? This is because the `memory.context` is now seeded with the facts and entities from our last use of the session. For example:

```xml
<FACTS>
  - Ken is working on a Personal AI project. (2024-12-05 03:29:10 - present)
  - user has the email of ken@unremarkable.ai (2024-12-05 03:28:40 - present)
  - The user's name is Ken. (2024-12-05 03:28:40 - 2024-12-05 03:29:01)
  - user has the id of 1 (2024-12-05 03:28:40 - present)
</FACTS>

<ENTITIES>
  - Ken Collins: Ken Collins is working on a Personal AI project and is seeking ideas for use cases.
</ENTITIES>
```

So now we have a working demo that leverages Zep for both:

- memory.context
- memory.messages

But we can do a little better. Why not ask the user what they would like to do when they next login to their session.

### With Zep 4

Playing with `zep.memory.synthesizeQuestion`. Seems this is a great way to build a retrieval query.

### With Zep 5

Testing now how and when using `zep.graph.add` inform the memory.

https://help.getzep.com/understanding-the-graph

> Zep’s knowledge graph powers its facts and memory capabilities. Zep’s graph is built on Graphiti, Zep’s open-source temporal graph library, which is fully integrated into Zep. Developers do not need to interact directly with Graphiti or understand its underlying implementation.

> The graph.add endpoint has a data size limit of 300,000 characters.

https://help.getzep.com/graphiti/graphiti/overview

> Assistants that learn from user interactions, fusing personal knowledge with dynamic data from business systems like CRMs and billing platforms.

> Agents that autonomously execute complex tasks, reasoning with state changes from multiple dynamic sources.

>  However, GraphRAG did not address our core problem: It’s primarily designed for static documents and doesn’t inherently handle temporal aspects of data.

> Graphiti is designed from the ground up to handle constantly changing information, hybrid semantic and graph search, and scale:

Add resume data

As we can see, we have a rich "Ken Collins" node.

<Screenshot 2024-12-12 at 11.09.12 PM>

However

```
> Tell me about my career.
<- No memory context, or relevantFacts.
I don't have any information about your career. Our conversation just started...

> Tell me about my career.
<- memory.context: 
  <FACTS>
  - user has the name of Ken Collins (2024-12-13 04:05:53 - present)
  </FACTS>
  <ENTITIES>
  - Ken Collins is recognized for his enthusiasm for knowledge-sharing...
  </ENTITIES>
<- relevantFacts: 
  fact: 'user has the email of ken@unremarkable.ai',
  name: 'HAS_USER_EMAIL',

You are Ken Collins, and your career has been marked by a strong focus on leadership, product development, and business strategy... with a particular emphasis on applying technology to drive business outcomes.
```

⚠️ There is a little gotcha. Initilialzing the user's graph with data only shows up as context or relevant facts after one conversation turn. I am not sure if this is a way I could implement the memory in a way where this works?

My assumption here is that based on the first message, there is some form of retrieval happening in the background to populate these based on that conversation turn. We could test this by asking a random qustion such as "What color are common tennis balls?" first using a fresh user and sesssion. Our knowledge graph now has two islands of data.

<Screenshot 2024-12-12 at 11.24.10 PM>

The answer to the qeustion was correct too, "Common tennis balls are yellow". Now if I try to ask it for the first time about my career, our agent still comes back with "I don't have any information about your career...". One way we can solve for this is to send a greeting from the user before the conversation loop starts. For example, doing this would allow the assistant to know who you are and tell you about your career from the first personal interaction.

```javascript
const myResume = await fs.readFile("./resumes/ken.json", "utf-8");
await zep.graph.add({ userId: userId, type: "json", data: myResume });
await chat("Hi my name is Ken Collins.");

while (true) {
  const newUserMessage = await inquire();
  if (newUserMessage.toLowerCase() === "exit") break;
  await chat(newUserMessage);
}
```

Let's keep exploring the graph in different formats

### With Zep 6

> With ChatGPT
Convert this resume in Markdown format to JSON. Use object notion consistent with resumes knowing that this JSON document will be fed into a neo4j knowledge graph. Include profile and work history with relevant skills for each item.

Now using that JSON with `type: "json"` option for `zep.graph.add`.

We can now see the JSON formatting which starts with a name that matches our user node helps us build a more meaningful graph.

```
{
  "name": "Ken Collins",
  "headline": "Product & Engineering Leader",
  ...
```

<Screenshot 2024-12-12 at 11.47.26 PM>

The facts associated with this user's node reflect this and our second conversation turn for "Tell me about my career." now returns a very rich response.

<Screenshot 2024-12-12 at 11.50.20 PM>

### With Zep 7

Goals:

* Can we control how facts are created and rated in a session?
* Can we query the graph in real-time?
* What are ways we can search/explore the graph?

The visual graph now shows that we can directly control the intake of knowledge and memories into the graph. Here we see one that more prominently shows a skill tree.

<Screenshot 2024-12-13 at 1.05.43 PM>

And the captured facts now mostly use the `HAS_SKILL` relationship. ⚠️ Still not seeing fact ratings. Turn based chat with our message of "Tell me about my career." now returns a response that is more focused on the skills we have.

```markdown
Ken Collins, based on the information available, it appears that you have a diverse and accomplished career in Product & Engineering Leadership. You have held various positions in the technology and business sectors, including:

1. Product Enterprise Innovation lead at Custom Ink, where you've been instrumental in aligning innovative product solutions with strategic growth objectives. Notable achievements include designing AI intelligence that contributed to a $10 million sales increase and implementing organizational AI capabilities with OpenAI Enterprise.
2. Principal Software Engineer and Sr. Software Engineer at Custom Ink, where you emphasized technical vision and narrative storytelling for product innovation.
3. Sr. Application Architect at PharmMD, where you streamlined system integration for a pharmacist call queue.
4. Sr. Software Engineer at Decisiv, where you led the development of a multi-tenant Rails application for the heavy truck industry.
5. Marketing Director at ArcaMax Publishing, where you enhanced profitability through integrated marketing strategies.
6. Technical Director at Stratum Marketing, where you applied your design and technology expertise to various consumer brands.

Throughout your career, you've demonstrated expertise in various areas, including:

- Business Strategy
- Leadership Alignment
- Generative AI & LLMs
- Product Development
- Cloud Architecture
- Agile Development
- Customer Data Platforms
- Enterprise Search & RAG
- Kubernetes & AWS Lambda
- Build v. Buy Platforms

You've also received several awards for your contributions, including being named an AWS Hero for your work on cloud-native integrations and receiving the Innovation Juggernaut award from Custom Ink for innovations that significantly boosted revenue.
```

We did explore using `zep.graph.search` using a skill-based query we found that adding data to the graph takes a while. When searching on a new session with a resume added, graph edges would have only the default user facts. For example:

> What skills does the candidate have with GenAI?

- user has the id of 1
- user has the email of ken@unremarkable.ai
- user has the name of Ken Collins

However, if we wait ~40s and ask the same question, we get a response that is more focused on the skills we have.

> What skills does the candidate have with GenAI?

- Ken Collins has skills in Generative AI & LLMs.
- Ken Collins has skills in Developer Experience.
- Ken Collins has skills in Business Strategy.
- Ken Collins is located in Portsmouth, Virginia.
- Ken Collins has skills in Business Automation.
- Ken Collins has skills in Leadership Alignment.
- Ken Collins has skills in Product Development.
- Ken Collins has skills in Kubernetes & AWS Lambda.
- Ken Collins has skills in Agile Development.
- Ken Collins has skills in Enterprise Search & RAG.

We can search for more specific facts too.

> What skills did the candidate gain at Decisiv?

- Ken Collins worked at Decisiv as a lead developer of a multi-tenant Rails application for the heavy truck industry and authored the SQL Server Adapter for Rails & TinyTDS C extension for Ruby.

### With Zep 8

https://help.getzep.com/structured-data-extraction

Exploring Structured Data Extraction (SDE) with Zep.

⚠️ Only works from messages sent to memory. So in this example, we are switching from adding the resume to the graph and sending it to memory via chat messages instead.
