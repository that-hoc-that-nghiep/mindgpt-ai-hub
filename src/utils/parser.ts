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
  const lines = markdown.split('\n').map((line) => line.trim());
  const result: Question[] = [];

  let currentQuestion: string | null = null;
  let currentAnswers: Answer[] = [];
  let correctAnswer: string | null = null;

  for (const line of lines) {
    // Ignore lines that don't start with ###, -, or >
    if (
      !line.startsWith('###') &&
      !line.startsWith('-') &&
      !line.startsWith('>')
    ) {
      continue;
    }

    if (line.startsWith('###')) {
      // Save the previous question if there's any
      if (currentQuestion && currentAnswers.length > 0) {
        result.push({
          question: currentQuestion,
          answers: currentAnswers,
        });
      }

      // Start a new question
      currentQuestion = line.replace('### ', '');
      currentAnswers = [];
      correctAnswer = null;
    } else if (line.startsWith('-')) {
      const answerMatch = line.match(/^-\s([A-D]):\s(.+)/);
      if (answerMatch) {
        const [, option, answerText] = answerMatch;
        currentAnswers.push({
          answer: answerText,
          isCorrect: false, // Set to false initially, will update if correct
        });
      }
    } else if (line.startsWith('>')) {
      correctAnswer = line.replace('> ', '');
      // Update the correct answer in the currentAnswers array
      for (let answer of currentAnswers) {
        if (answer.answer.startsWith(correctAnswer)) {
          answer.isCorrect = true;
        }
      }
    }
  }

  // Add the last question if exists
  if (currentQuestion && currentAnswers.length > 0) {
    result.push({
      question: currentQuestion,
      answers: currentAnswers,
    });
  }

  return result;
}
