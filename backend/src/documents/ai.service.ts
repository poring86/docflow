import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { ChatGroq } from '@langchain/groq';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs';
import * as path from 'path';
const pdf = require('pdf-parse');
import * as mammoth from 'mammoth';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}
  
  private isValidKey(key: string | undefined): boolean {
    return !!key && key.length > 20 && !key.includes('sua_chave_aqui') && !key.includes('your_key_here');
  }

  private hasEmbeddingsApi(): boolean {
    return this.isValidKey(process.env.GEMINI_API_KEY) || this.isValidKey(process.env.OPENAI_API_KEY);
  }

  private getDefaultProvider(): string {
    if (process.env.AI_PROVIDER) return process.env.AI_PROVIDER.toLowerCase();
    if (this.isValidKey(process.env.GROQ_API_KEY)) return 'groq';
    if (this.isValidKey(process.env.OPENAI_API_KEY)) return 'openai';
    if (this.isValidKey(process.env.GEMINI_API_KEY)) return 'gemini';
    if (this.isValidKey(process.env.GROK_API_KEY)) return 'grok';
    return 'groq'; // Default to groq
  }

  private getEmbeddings(provider: string = 'openai') {
    const providerLower = provider.toLowerCase();
    
    // For Gemini, use Gemini embeddings
    if (providerLower === 'gemini' && this.isValidKey(process.env.GEMINI_API_KEY)) {
      return new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "embedding-001",
      });
    }

    // For any provider, try to use available embedding APIs
    if (this.isValidKey(process.env.GEMINI_API_KEY)) {
      return new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: "embedding-001",
      });
    }

    if (this.isValidKey(process.env.OPENAI_API_KEY)) {
      return new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "text-embedding-3-small",
      });
    }

    return null;
  }

  private getModel(provider: string = 'openai') {
    switch (provider.toLowerCase()) {
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          apiKey: process.env.GEMINI_API_KEY,
          model: "gemini-1.5-pro",
        });
      case 'groq':
        return new ChatGroq({
          apiKey: process.env.GROQ_API_KEY,
          model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
        });
      case 'grok':
        return new ChatOpenAI({
          openAIApiKey: process.env.GROK_API_KEY,
          configuration: {
            baseURL: "https://api.x.ai/v1",
          },
          modelName: process.env.GROK_MODEL || "grok-beta",
        });
      case 'openai':
      default:
        return new ChatOpenAI({
          openAIApiKey: process.env.OPENAI_API_KEY,
          modelName: "gpt-4-turbo-preview",
        });
    }
  }

  private async extractDocumentText(doc: any): Promise<string> {
    const filePath = path.join(process.cwd(), doc.path);
    let text = '';

    if (doc.filename.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      text = data.text;
    } else if (doc.filename.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else if (doc.filename.endsWith('.pptx')) {
      const officeParser = require('officeparser');
      text = await new Promise((resolve, reject) => {
        officeParser.parseOffice(filePath, (data, err) => {
          if (err) reject(err);
          resolve(data);
        });
      });
    } else {
      text = fs.readFileSync(filePath, 'utf8');
    }

    return text;
  }

  async indexDocument(documentId: string, provider: string = this.getDefaultProvider()) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) return;

    // Check if we have an embedding API available
    if (!this.hasEmbeddingsApi()) {
      console.log(`Skipping vector indexing for ${doc.filename} - no embedding API configured. Direct text mode will be used.`);
      return;
    }

    try {
      const text = await this.extractDocumentText(doc);

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const chunks = await splitter.createDocuments([text]);
      const embeddings = this.getEmbeddings(provider);

      if (!embeddings) {
        console.log(`No embeddings available, skipping indexing for ${doc.filename}`);
        return;
      }

      for (const chunk of chunks) {
        const embedding = await embeddings.embedQuery(chunk.pageContent);
        
        await this.prisma.$executeRaw`
          INSERT INTO "DocumentChunk" (id, "documentId", content, embedding)
          VALUES (
            ${crypto.randomUUID()}, 
            ${documentId}, 
            ${chunk.pageContent}, 
            ${embedding}::vector
          )
        `;
      }

      console.log(`Document ${doc.filename} indexed successfully with ${chunks.length} chunks.`);
    } catch (error) {
      console.error(`Failed to index document ${documentId}:`, error);
    }
  }

  async askQuestion(documentId: string, question: string, provider: string = this.getDefaultProvider()) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!doc) {
      return { answer: "Documento não encontrado.", context: "", similarity: 0, provider };
    }

    let context = '';

    // Try vector search first if embeddings are available
    if (this.hasEmbeddingsApi()) {
      try {
        const embeddings = this.getEmbeddings(provider);
        if (embeddings) {
          const questionEmbedding = await embeddings.embedQuery(question);

          const relevantChunks: any[] = await this.prisma.$queryRaw`
            SELECT content, 1 - (embedding <=> ${questionEmbedding}::vector) as similarity
            FROM "DocumentChunk"
            WHERE "documentId" = ${documentId}
            ORDER BY embedding <=> ${questionEmbedding}::vector
            LIMIT 10
          `;

          if (relevantChunks.length > 0) {
            context = relevantChunks.map(c => c.content).join('\n\n');
          }
        }
      } catch (error) {
        console.log('Vector search failed, falling back to direct text:', error.message);
      }
    }

    // Fallback: read document directly if no vector context available
    if (!context) {
      try {
        const fullText = await this.extractDocumentText(doc);
        // Limit context to first ~8000 characters to fit in LLM context window
        context = fullText.substring(0, 8000);
        if (fullText.length > 8000) {
          context += '\n\n[... documento truncado para caber no contexto ...]';
        }
      } catch (error) {
        console.error('Failed to extract document text:', error);
        return { 
          answer: "Erro ao ler o documento. Verifique se o arquivo existe.", 
          context: "", 
          similarity: 0, 
          provider 
        };
      }
    }

    const model = this.getModel(provider);
    
    const prompt = `Você é um analista de documentos do DocFlow (um sistema Cyberpunk de alta tecnologia).
Use o contexto abaixo para responder a pergunta do operador. 
Se a informação não estiver no contexto, diga que não encontrou nos registros neurais.

CONTEXTO:
${context}

PERGUNTA: ${question}
`;

    const response = await model.invoke(prompt);
    
    return {
      answer: response.content,
      context: context.substring(0, 500),
      similarity: 1, // Direct text mode always has full context
      provider: provider
    };
  }
}

