# CrisisGuard AI — Devpost Submission Pitch

## Inspiration
The mental health crisis is the silent pandemic of our generation. Millions of crisis signals—cries for help, expressions of hopelessness, and indicators of self-harm—are broadcasted across digital platforms every day, yet they often go unnoticed until it's too late. While there are AI tools out there, most organizations are afraid to use them because routing highly sensitive mental health data to third-party APIs (like OpenAI or Claude) violates strict privacy and compliance regulations (like HIPAA). We wanted to build a tool that saves lives *without* sacrificing privacy.

## What it does
**CrisisGuard AI** is a real-time, privacy-first mental health crisis detection and triage platform. 
Instead of acting as a generic chatbot, it acts as a clinical-grade monitoring dashboard for institutional responders (universities, crisis hotlines, community moderators).

1. **Multi-Layer NLP Detection:** It analyzes text against 9 distinct risk categories (including Suicidal Ideation, Violence, Severe Distress, and Depression).
2. **Clinical Severity Scoring:** It calculates a 0-100 risk score by weighing the detections against sentiment analysis, temporal urgency modifiers ("right now", "tonight"), and protective factors ("but I have my kids").
3. **Context-Aware AI Advice:** It generates specific, actionable response protocols tailored to the exact nature of the text (e.g., advising the QPR method for suicidal ideation, or de-escalation for severe anxiety).
4. **Live Monitoring:** A dashboard that simulates the real-time ingestion of data streams, flagging critical alerts instantly.

## How we built it
We built CrisisGuard AI entirely with **HTML5, CSS3, and Vanilla JavaScript**, deliberately avoiding heavy backend frameworks to prove a point about edge-computing and privacy.
- **The AI Engine:** We engineered a custom, client-side Lexical & Semantic NLP pipeline (`nlp-engine.js`). It performs tokenization, sentiment analysis, and severity calculations directly in the browser. 
- **The UI/UX:** We used raw CSS3 to create a stunning, professional "glassmorphism" interface. We implemented a custom HTML5 Canvas particle system to render a live, interactive neural network in the background.
- **Data Visualization:** We integrated Chart.js for real-time trend analytics.

## Challenges we ran into
The biggest challenge was building a robust NLP engine without relying on external LLM APIs. Teaching a client-side JavaScript engine to understand the difference between *"I am killing this project"* (positive) and *"I am going to kill myself"* (critical) required careful implementation of sentiment modifiers, context windows, and multi-word phrase matching. We also spent significant time optimizing the HTML5 Canvas animations to ensure they ran at a smooth 60fps without draining the user's battery.

## Accomplishments that we're proud of
We are incredibly proud of achieving **100% Data Privacy**. The fact that our multi-layer NLP engine runs entirely in the user's browser means that zero sensitive data is ever transmitted over the network. We are also incredibly proud of the UI—we managed to build a platform that looks like a premium, enterprise-grade SaaS product using only Vanilla CSS and JavaScript.

## What we learned
We learned that you don't always need massive, cloud-based LLMs to build effective AI tools. For specific, high-stakes tasks like triage classification, deterministic edge-computing models can be faster, more private, and highly reliable.

## What's next for CrisisGuard AI
1. **API Integration:** Developing a secure webhook system so universities and clinics can pipe their anonymous chat logs into the CrisisGuard engine.
2. **Multi-Lingual Support:** Expanding the crisis lexicon to support Spanish, Mandarin, and Hindi.
3. **Browser Extension:** Creating a Chrome extension that allows moderators to analyze highlighted text anywhere on the web with a single click.
