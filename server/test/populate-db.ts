import * as dotenv from 'dotenv';
import * as path from 'path';
import fetch from 'node-fetch';
import { IQuestion } from '../src/types';

dotenv.config({path: path.join(__dirname, '../../.env')});
const PORT = Number(process.env.WEB_PORT);
const ENDPOINT = `localhost:${PORT}`

async function main() {
  const questionResponse = await fetch(`${ENDPOINT}/api/questions`);
  const questions = await questionResponse.json() as IQuestion[];
  for (let question of questions) {
    console.log(question.question);
  }
}

