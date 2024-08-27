import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'openai-edge'
import { Configuration, OpenAIApi } from 'openai-edge'
import { auth } from '@auth'
import { nanoid } from '@lib/utils'

export const runtime = 'edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken } = json
  const session = await auth()

  if (session == null) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  // Make an OpenAI API call to get the response
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4o-mini', // Replace with your desired model
      messages,
      stream: true // Set to true if you want streaming responses
    })

    const aiResponse = await response.json()

    return new Response(JSON.stringify(aiResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return new Response('Error communicating with OpenAI API', {
      status: 500
    })
  }
}