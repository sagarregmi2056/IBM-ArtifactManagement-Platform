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
                    processedData = similarArtifacts.map(art => ({
                        name: art.payload.name,
                        version: art.payload.version,
                        type: art.payload.type,
                        description: art.payload.description,
                        similarity: art.score
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
        const contextStr = JSON.stringify(context.data);

        const completion = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: `Query: ${query}\nContext: ${contextStr}`
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
            ARTIFACT_SEARCH: `You are an AI assistant helping with artifact management.
                            The provided data contains vector search results of artifacts, ordered by relevance.
                            Each result includes name, version, type, and description.
                            Focus on the most relevant matches and explain why they match the query.
                            If no exact matches are found, suggest the closest alternatives.`,
            
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