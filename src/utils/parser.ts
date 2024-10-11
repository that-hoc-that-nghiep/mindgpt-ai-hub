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
  return mermaidCode ? mermaidCode[1].trim() : ''; // Return Mermaid code or empty string
};
