// app/api/waitlist/route.js
import { addToWaitlist } from '@/lib/db'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const result = await addToWaitlist(email)

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error adding to waitlist:', error)
    return new Response(JSON.stringify({ error: 'Failed to add to waitlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}