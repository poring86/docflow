# 🌐 DocFlow: Artificial Intelligence Document Ecosystem

**DocFlow** is a high-performance, containerized Document Management System (DMS) built for the modern era. It fuses professional collaborative editing with a state-of-the-art **Neural Assistant** capable of deep document analysis through Retrieval-Augmented Generation (RAG).

---

## ⚡ Key Capabilities

### 🖋️ Collaborative Cyber-Editing
Integrated with **OnlyOffice Document Server**, DocFlow provides a desktop-class editing experience directly in the browser.
- **Bi-directional Sync**: Edits made in the editor are automatically tracked and mirrored in the database.
- **Support for Multi-formats**: Native handling of `.docx`, `.xlsx`, `.pptx`, and `.pdf`.
- **Auto-Reindexing**: The AI engine automatically re-analyzes documents after every save session.

### 🧠 Neural Assistant (AI-RAG Engine)
A powerful AI sidekick that "reads" your documents.
- **RAG Architecture**: Uses **Recursive Character Text Splitting** and **Vector Embeddings** to provide precise, context-aware answers.
- **Multi-Model Intelligence**: Switch between **OpenAI (GPT-4)**, **Google (Gemini 1.5 Pro)**, **Groq (Llama 3)**, and **xAI (Grok)** on the fly.
- **Universal Parsing**: Advanced extraction logic for PDF (text/layout), DOCX (Mammoth), and PPTX (OfficeParser).

### 🛡️ Secure Infrastructure
- **Vector Database**: PostgreSQL with **PGVector** for efficient high-dimensional similarity searches.
- **Isolated Containers**: Fully orchestrated via **Docker Compose** for consistent deployment.

---

## 🏗️ Technical Architecture

### **Backend (The Core)**
- **Framework**: [NestJS](https://nestjs.com/) (Node.js)
- **Database/ORM**: [Prisma](https://www.prisma.io/) with PostgreSQL + PGVector.
- **AI Orchestration**: [LangChain](https://js.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraphjs/).
- **Processing**: Multer (Uploads), Axios (Service communication), Mammoth/PDF-Parse (Content extraction).

### **Frontend (The Deck)**
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/).
- **UI System**: [HeroUI](https://heroui.com/) (High-performance components).
- **Styling**: TailwindCSS with Custom Cyberpunk Tokens.
- **State/Logic**: Framer Motion (Animations), React Icons (Lucide/Remix).

### **Data Flow (The Pulse)**
```mermaid
graph TD
    User[User Uploads Doc] --> Backend[NestJS Backend]
    Backend --> DB[(PostgreSQL + PGVector)]
    Backend --> Parser[Content Extractor]
    Parser --> Embed[Embedding API: OpenAI/Gemini]
    Embed --> Vector[Vector Storage]
    
    User --> Editor[OnlyOffice Editor]
    Editor --> Track[Callback API]
    Track --> Backend
    
    User --> Chat[AI Assistant]
    Chat --> Search[Vector Similarity Search]
    Search --> LLM[LLM Generator: GPT-4/Llama/Gemini]
    LLM --> Chat
```

---

## 🚦 Getting Started

### 📦 Prerequisites
- **Docker** & **Docker Compose** (Required)
- No local Node.js or Database installation needed.

### 🛠️ Installation

1. **Clone the data-stream**:
   ```bash
   git clone https://github.com/your-repo/docflow.git
   cd docflow
   ```

2. **Configure Neural Keys** (`backend/.env`):
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@postgres:5432/docflow?schema=public"

   # AI Providers (At least one is required for Embeddings)
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   GROQ_API_KEY=...
   GROK_API_KEY=...
   
   # Configuration
   AI_PROVIDER=groq # Default provider
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

3. **Ignite the system**:
   ```bash
   docker-compose up --build
   ```

### 🔗 Access Points
- **System Interface**: [http://localhost:3001](http://localhost:3001)
- **Neural API**: [http://localhost:3000](http://localhost:3000)
- **Document Engine**: [http://localhost:8080](http://localhost:8080)

---

## 📁 Neural Directory Structure

- `backend/`: NestJS services, AI RAG logic, and Prisma models.
- `frontend/`: React components, HeroUI integration, and Editor logic.
- `onlyoffice_data/`: Persistent storage for the document server.
- `docker-compose.yml`: Infrastructure definition.

---

## 📜 Neural License
DocFlow Protocol - Internal Use Only.
