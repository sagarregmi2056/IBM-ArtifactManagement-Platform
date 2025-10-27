const { OpenAI } = require('openai');
const vectorService = require('./vectorService');
const embeddingService = require('./embeddingService');
const logger = require('../utils/logger');

class ChatService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async processQuery(query) {
        try {
            logger.info('Processing chat query:', query);

            // Analyze query intent
            const intent = await this.analyzeQueryIntent(query);
            
            // Get relevant context based on intent
            const context = await this.getQueryContext(query, intent);

            // Generate response using context
            const response = await this.generateResponse(query, context, intent);

            return response;
        } catch (error) {
            logger.error('Error processing chat query:', error);
            throw error;
        }
    }

    async analyzeQueryIntent(query) {
        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `Analyze the query intent. Possible intents:
                        - ARTIFACT_SEARCH: Looking for specific artifacts
                        - DEPLOYMENT_INFO: Questions about deployments
                        - ISSUE_QUERY: Questions about issues or problems
                        - COMMIT_INFO: Questions about specific commits
                        Return only the intent type.`
                },
                {
                    role: "user",
                    content: query
                }
            ],
            temperature: 0
        });

        return completion.choices[0].message.content.trim();
    }

    async getQueryContext(query, intent) {
        try {
            // Generate embedding for the query
            const embedding = await embeddingService.generateEmbedding(query);
            
            // Search for relevant artifacts
            const similarArtifacts = await vectorService.searchSimilar(embedding, 5);
            
            // Process the artifacts based on intent
            let processedData = [];
            
            switch (intent) {
                case 'ARTIFACT_SEARCH':
                    processedData = similarArtifacts.map((art, index) => ({
                        name: art.payload.name,
                        version: art.payload.version,
                        type: art.payload.type,
                        description: art.payload.description,
                        relevance: Math.round(art.score * 100) + '%'  // Convert to percentage
                    }));
                    break;

                case 'DEPLOYMENT_INFO':
                    processedData = similarArtifacts
                        .filter(art => art.payload.lastUpdated)
                        .map(art => ({
                            name: art.payload.name,
                            version: art.payload.version,
                            deployedAt: art.payload.lastUpdated,
                            status: art.payload.status
                        }));
                    break;

                case 'ISSUE_QUERY':
                    processedData = similarArtifacts
                        .filter(art => art.payload.metadata?.issues)
                        .map(art => ({
                            name: art.payload.name,
                            version: art.payload.version,
                            issues: art.payload.metadata.issues
                        }));
                    break;

                case 'COMMIT_INFO':
                    processedData = similarArtifacts
                        .filter(art => art.payload.commitHash)
                        .map(art => ({
                            name: art.payload.name,
                            version: art.payload.version,
                            commitHash: art.payload.commitHash,
                            branchName: art.payload.branchName
                        }));
                    break;
            }

            return {
                type: intent.toLowerCase(),
                data: processedData,
                totalResults: processedData.length,
                query: query
            };
        } catch (error) {
            logger.error('Error getting query context:', error);
            throw error;
        }
    }

    async generateResponse(query, context, intent) {
        const systemPrompt = this.getSystemPrompt(intent);
        
        // Format context data as a clean list for the AI
        const formattedContext = context.data.map((item, index) => {
            return `${index + 1}. ${item.name} (${item.version}) - ${item.type}${item.description ? `: ${item.description}` : ''}${item.relevance ? ` [${item.relevance} relevant]` : ''}`;
        }).join('\n');

        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `User asked: "${query}"\n\nAvailable artifacts:\n${formattedContext}`
                }
            ],
            temperature: 0.7
        });

        return {
            response: completion.choices[0].message.content,
            context: context,
            intent: intent
        };
    }

    getSystemPrompt(intent) {
        const prompts = {
            ARTIFACT_SEARCH: `You are a helpful assistant that explains artifacts in simple, clear language.
                            When the user asks about artifacts, provide:
                            1. A friendly, conversational response
                            2. List the artifacts found with their key details
                            3. Dont use percentages for relevance just say the relevance in the context
                            4. Write naturally - avoid technical jargon
                            5. If multiple matches exist, list them in order of relevance
                            6. Dont use any other words just the context
                            
                            Keep responses concise and easy to understand.`,
            
            DEPLOYMENT_INFO: `You are analyzing deployment information from our vector database.
                            The data shows artifacts with their deployment timestamps and status.
                            Focus on recent deployments and their current status.
                            If asked about specific timeframes, prioritize matches within that period.`,
            
            ISSUE_QUERY: `You are analyzing artifact-related issues from our vector database.
                         The data includes artifacts and their associated issues from metadata.
                         Prioritize critical issues and recent problems.
                         Group similar issues together if multiple artifacts are affected.`,
            
            COMMIT_INFO: `You are analyzing version control information from our vector database.
                         The data shows artifacts with their commit hashes and branch information.
                         Focus on explaining which artifacts were affected by specific commits.
                         If asked about specific branches, prioritize those matches.`
        };

        return prompts[intent] || prompts.ARTIFACT_SEARCH;
    }
}

module.exports = new ChatService();