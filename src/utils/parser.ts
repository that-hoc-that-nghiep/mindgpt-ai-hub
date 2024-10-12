import { BadRequestException } from '@nestjs/common';
import { SelectedNodeDto } from 'src/mindmap/dto/selected-node.dto';

async function* toLine(
  inputStream: AsyncIterable<string>,
): AsyncIterable<string> {
  let buffer: string[] = [];
  for await (const text of inputStream) {
    buffer.push(text);
    if (text.includes('\n')) {
      yield buffer.join('');
      buffer = [];
    }
  }
  if (buffer.length > 0) {
    yield buffer.join('');
    buffer = [];
  }
  yield '\n';
}

export const extractMermaidCode = (output: string) => {
  const mermaidCode = output.match(/```mermaid([\s\S]*?)```/);
  if (mermaidCode) {
    // Replace all newlines with \\n
    const replaceNewlines = mermaidCode[0].replace(/\n/g, '\\n');
    //Parse all " to \"
    const parseQuote = replaceNewlines.replace(/"/g, '\\"');
    return parseQuote;
  }
  // return mermaidCode ? mermaidCode[1].trim() : ''; // Return Mermaid code or empty string
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
