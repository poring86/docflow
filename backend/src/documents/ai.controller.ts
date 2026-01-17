import { Controller, Post, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post(':id/ask')
  async ask(
    @Param('id') id: string, 
    @Body('question') question: string,
    @Body('provider') provider?: string
  ) {
    return this.aiService.askQuestion(id, question, provider);
  }
}
