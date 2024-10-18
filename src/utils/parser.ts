import { BadRequestException } from '@nestjs/common';
import { SelectedNodeDto } from 'src/mindmap/dto/selected-node.dto';
import { Answer, Question } from 'src/types';

export const extractMermaidCode = (output: string) => {
  const mermaidCode = output.match(/```mermaid([\s\S]*?)```/);
  if (mermaidCode) {
    // Replace all newlines with \\n
    const replaceNewlines = mermaidCode[0].replace(/\n/g, '\\n');
    //Parse all " to \"
    const parseQuote = replaceNewlines.replace(/"/g, '\\"');
    return parseQuote;
  }
};

export const nodesToString = (selectedNodes: SelectedNodeDto[]) => {
  return selectedNodes.map((node) => `${node.id}["${node.name}"]`).join(', ');
};

export const parseMermaidCode = (output: string) => {
  try {
    // Replace all newlines with \n
    const replaceNewlines = output.replace(/\\n/g, '\n');
    // Replace all \" to "
    const parseQuote = replaceNewlines.replace(/\\"/g, '"');

    return parseQuote;
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

export function parseMarkdownQuestionToJson(markdown: string): Question[] {
  const questionBlocks = markdown.split(/\n(?=### )/); // Split markdown by questions
  const questions: Question[] = [];

  questionBlocks.forEach((block) => {
    const lines = block.trim().split('\n');

    if (lines.length < 3) return;

    // Extract the question (the first line, starting with ###)
    if (!lines[0].startsWith('###')) {
      console.warn(`Invalid question format: ${lines[0]}`);
      return;
    }
    const questionText = lines[0].replace(/^###\s*/, '').trim();

    const answers: Answer[] = [];
    let correctAnswer = '';

    // Process each line after the question
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check for invalid lines
      if (!line.startsWith('- ') && !line.startsWith('> ')) {
        console.warn(`Skipping invalid line: ${line}`);
        continue; // Skip invalid lines
      }

      // Extract answers (lines starting with "- ")
      if (line.startsWith('- ')) {
        const answerText = line.replace(/^- [A-D]:\s*/, '').trim();
        answers.push({ answer: answerText, isCorrect: false });
      }

      // Extract the correct answer (line starting with "> ")
      if (line.startsWith('> ')) {
        correctAnswer = line.replace(/^>\s*/, '').trim();
      }
    }

    // Mark the correct answer
    const correctIndex = correctAnswer.charCodeAt(0) - 65; // 'A' => 0, 'B' => 1, etc.
    if (answers[correctIndex]) {
      answers[correctIndex].isCorrect = true;
    }

    questions.push({ question: questionText, answers });
  });

  return questions;
}

export function extractExplanation(response: string): string {
  // Split the response by the '---' symbol
  const parts = response.split('---');

  // If there's a second part, return the explanation (trim to remove extra spaces)
  if (parts.length > 1) {
    return parts[1].trim();
  }

  // Return an empty string if no explanation is found
  return '';
}
