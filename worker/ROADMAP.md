# Assistant — Development Roadmap

## Current State (v1)

A portfolio chat assistant at gerov.dev that answers questions about Velislav Gerov's professional background. Visitors click "Assistant" in the social icons row, a chat modal opens, and they can ask questions or use conversation starters.

### Architecture
- **Frontend**: Vanilla JS chat widget inline in `index.html` (~200 lines CSS, ~170 lines JS)
- **Backend**: Cloudflare Worker (`worker/src/index.ts`) proxying to Anthropic Claude API
- **Model**: Claude Haiku 4.5, streaming via SSE, 1024 max tokens
- **System prompt**: ~1,500 tokens — full resume baked into a single string constant
- **Prompt caching**: Enabled via `cache_control: { type: "ephemeral" }` (5-min TTL)
- **Rate limiting**: 10 messages/IP/hour via Cloudflare KV
- **Analytics**: PostHog (cookieless) — `$ai_generation` events with token counts, latency, cache metrics, full question/answer text. Plus `assistant_opened`, `assistant_starter_clicked`, `assistant_error` events.
- **Voice**: Third-person assistant ("Velislav is...", "He built...")
- **Deploy**: Worker via `wrangler deploy`, frontend via GitHub Pages (push to master)

### Key URLs
- Site: https://gerov.dev
- Worker: https://assistant.gerov.workers.dev
- PostHog: EU instance (cookieless, no GDPR banner)

---

## Phase 1: Enrich Context

**Goal**: Make the assistant's answers deeper and more differentiated from the PDF resume.

### 1.1 Stories Behind the Bullets
Add 2-3 sentences per major achievement explaining the *how* — approach, tradeoffs, outcome.

Examples of thin areas to enrich:
- "Reduced DB utilisation from 40% to <5%" — What was the root cause? What was the pipeline redesign?
- "5x user growth and 50x traffic spikes" — What load testing approach? Which AWS services were key?
- "Built AI-powered smart coach prototype" — What was the RAG architecture? What data sources?
- "3 autonomous engineers" — What mentorship approach? How did you measure autonomy?

### 1.2 Technical Philosophy
Add opinions that reveal how Velislav thinks:
- Architecture preferences (monolith vs. microservices, when to abstract)
- AI/LLM development approach (prompt engineering, evaluation, production patterns)
- Team leadership style (code review philosophy, 1:1 structure, hiring criteria)
- Technology selection criteria (when to build vs. buy, framework choices)

### 1.3 FAQ Overrides
Pre-answer common questions to prevent hallucination:
- "Why London?" / "Why did you move from Sofia?"
- "Why Walking on Earth?"
- "Are you open to new roles?"
- "What's the difference between your TelebidPro and WONE work?"
- "What are you most proud of?"

### 1.4 Implementation
**Option A (Quick)**: Expand the `SYSTEM_PROMPT` string directly in `worker/src/index.ts`. Target ~3,000-4,000 tokens total. Prompt caching keeps cost manageable.

**Option B (Structured)**: Create `worker/knowledge/` with separate markdown files:
```
worker/knowledge/
  profile.md        — Summary, current role, location
  experience.md     — Detailed work history with stories
  projects.md       — Side projects with context
  philosophy.md     — Technical opinions, leadership style
  faq.md            — Pre-answered common questions
  education.md      — Degrees, certificates
```
Worker concatenates them into the system prompt at startup. Each file is easy to edit independently. Still one big cached prompt, but organized for maintainability.

**Recommendation**: Start with Option A to validate what content matters (use PostHog data to see what people ask), then migrate to Option B when the prompt exceeds ~4,000 tokens.

---

## Phase 2: Tool Use

**Goal**: Instead of sending the entire resume every time, let Claude request only the context it needs. Reduces cost per request, improves answer relevance, and enables live data in later phases.

### 2.1 Tool Definitions
```
get_work_experience(company?: string)
  → No args: timeline overview of all roles
  → With company: detailed bullets + stories for that role

get_project(name?: string)
  → No args: list of all projects with one-liners
  → With name: deep dive on a specific project

get_skills(category?: string)
  → Categories: "languages", "frameworks", "cloud", "ai", "leadership"
  → Returns relevant skills with context

get_education()
  → Degrees, certificates, grades

get_contact()
  → Email, links, location, availability status

get_philosophy(topic?: string)
  → Topics: "architecture", "ai", "leadership", "hiring", "tools"
  → Returns opinions and approach for that area
```

### 2.2 Architecture Change
- System prompt shrinks to: voice/personality rules + tool schemas (~800 tokens, cached)
- Each tool returns a focused knowledge chunk (~200-500 tokens)
- Worker implements a **tool-use loop**: call Claude → if tool_use response, execute tool, feed result back → repeat until Claude produces text
- Frontend stays unchanged (still receives streamed text from the final response)
- Knowledge data lives in `worker/knowledge/` as JSON or markdown files

### 2.3 Worker Tool-Use Loop
```
1. Client sends { messages }
2. Worker calls Claude with system prompt + tools + messages
3. If response is tool_use:
   a. Execute the tool (read from knowledge files)
   b. Append tool result to messages
   c. Call Claude again
   d. Repeat (max 3 tool calls per request)
4. If response is text:
   a. Stream to client as SSE (current behavior)
```

### 2.4 Cost Impact
- Without tools: ~1,500 input tokens (system) + conversation tokens every request
- With tools: ~800 input tokens (system+tools) + ~300 tokens per tool result + conversation
- Net savings on most requests, especially multi-turn conversations where the full resume is sent repeatedly
- Prompt caching still applies to the system prompt + tool definitions

---

## Phase 3: Progressive Disclosure

**Goal**: Conversations go deeper naturally. The model starts with summaries and drills into detail only when the question warrants it.

### 3.1 Two-Level Knowledge
Each knowledge module has a **summary** and **detail** layer:

```
get_work_experience()          → Timeline: "Tech Lead at WONE (2024-present), Senior Dev (2023), ..."
get_work_experience("WONE")    → Full bullets for the WONE Tech Lead role
get_details("WONE RAG system") → 3-paragraph story about the RAG architecture, decisions, outcomes
```

### 3.2 Model Behavior
The system prompt instructs Claude:
- For broad questions ("What does Velislav do?") → use summary tools, give an overview
- For specific questions ("How did the RAG system work?") → call detail tools, go deep
- For follow-ups → call detail tools on the topic the user is drilling into
- Always offer a natural follow-up suggestion

### 3.3 Conversation Depth Tracking
Track in PostHog:
- Average conversation length (are users going deep or bouncing?)
- Which topics get follow-ups (signals for where to add more detail)
- Tool call patterns (which tools get used most?)

---

## Phase 4: Live Tools

**Goal**: The assistant knows what's happening now, not just what's on the resume. Makes it feel current and dynamic.

### 4.1 GitHub Activity
```
get_github_activity()
  → Fetches recent public commits/repos via GitHub API
  → Returns: "Velislav has been active on X, Y, Z repos this week"
  → Cached in KV with 1-hour TTL
```

### 4.2 Project Status
```
get_project_status(name: string)
  → Checks if a project URL is live (HTTP HEAD)
  → For GitHub projects: fetch latest commit date, open issues count
  → Returns: "Pozdravi is live at pozdravi.gerov.dev, last updated 2 days ago"
  → Cached in KV with 6-hour TTL
```

### 4.3 Availability
```
get_availability()
  → Reads from a simple JSON file in KV or R2
  → You update it manually: { "status": "open to opportunities", "preferred": "tech lead / staff engineer", "location": "London, open to remote" }
  → Returns the current status to the model
```

### 4.4 Implementation Notes
- All live tools cache results in Cloudflare KV with TTLs to avoid API rate limits
- GitHub API: use a personal access token stored as a worker secret
- Fallback gracefully: if GitHub API is down, return "Activity data temporarily unavailable"
- Add `$ai_tool_call` PostHog events to track which live tools get used

---

## Phase 5: Evaluation & Quality

**Goal**: Systematically measure and improve response quality.

### 5.1 PostHog LLM Evaluations
- Use PostHog's built-in evaluation features to score responses
- Metrics: relevance, helpfulness, factual accuracy
- Set up automated scoring on `$ai_generation` events

### 5.2 Conversation Analytics Dashboard
Build a PostHog dashboard tracking:
- **Volume**: conversations per day, messages per conversation
- **Engagement**: % of visitors who open the assistant, % who send >1 message
- **Content gaps**: questions that get short/generic answers (low output tokens)
- **Errors**: rate limit hits, API failures, network errors
- **Cost**: total tokens per day, cache hit rate, estimated spend
- **Popular topics**: cluster questions by theme

### 5.3 Feedback Loop
1. Review PostHog data weekly
2. Identify thin answers (low output tokens, no follow-up)
3. Add knowledge for those topics
4. Track improvement in conversation depth

---

## Phase 6: Advanced Features

**Goal**: Polish and differentiation. Only pursue after Phases 1-5 are solid.

### 6.1 Prompt Management
- Use PostHog's prompt management (beta) to version and A/B test system prompts
- Test different voice tones, response lengths, follow-up strategies

### 6.2 Conversation Memory
- Store conversation context in KV (keyed by anonymous session ID)
- Allow returning visitors to continue a conversation (within a session)
- Respect cookieless constraint: memory expires with the page session

### 6.3 Rich Responses
- Return structured data for some answers (e.g., a skills chart, project timeline)
- Frontend renders these as visual components instead of plain text
- Keeps the brutalist aesthetic but adds information density

### 6.4 Multi-Language
- The assistant could answer in Bulgarian (relevant for Pozdravi, Bulgarian market context)
- System prompt instruction: "If the user writes in Bulgarian, respond in Bulgarian"

### 6.5 Voice/Audio
- Add a "listen" mode using Web Speech API
- User speaks a question, it's transcribed and sent to the assistant
- Response is read aloud via speech synthesis

---

## Technical Debt & Maintenance

### Ongoing
- **Keep resume data in sync**: When you update `resume.pdf`, update the system prompt / knowledge files
- **Monitor costs**: PostHog dashboard tracks token usage; set alerts if spend exceeds threshold
- **Wrangler updates**: Current version is 3.x, should update to 4.x when stable
- **Model upgrades**: Haiku is cost-effective now; re-evaluate when new models ship

### Architecture Decisions Log
| Decision | Rationale | Date |
|----------|-----------|------|
| Cloudflare Worker over Vercel/Lambda | Zero cold starts, free tier, works with GitHub Pages DNS | 2026-03-30 |
| Claude Haiku over Sonnet | Sufficient quality for resume Q&A, 6x cheaper | 2026-03-30 |
| Cookieless PostHog | Avoid GDPR cookie banner on a personal portfolio | 2026-03-30 |
| SSE over WebSocket | Simpler, stateless, works with CF Workers | 2026-03-30 |
| Inline CSS/JS over framework | Matches existing zero-dependency site philosophy | 2026-03-30 |
| Third-person assistant voice | Cleaner UX than pretending to be Velislav | 2026-03-30 |
| Client-side PostHog + worker metadata | Best of both: page events + LLM metrics without server-side PostHog | 2026-03-30 |
