import prompts from 'prompts';
import * as fs from 'fs';
import * as path from 'path';

const questions: prompts.PromptObject[] = [
  {
    type: 'text',
    name: 'queue',
    message: 'Input your own queue: ',
  },
];

(async () => {
  const response = await prompts(questions);
  let content = '';
  const keys = Object.keys(response);
  for (const key of keys) {
    content += `${key.toUpperCase()}=${response[key]}\n`;
  }
  fs.writeFileSync(path.join(__filename, '../../.env.private'), content);
})();
