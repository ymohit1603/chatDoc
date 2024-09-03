import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { createUser } from '@/lib/users';

export async function POST(req: Request) {
 
    console.log("request form clerk webhook");
  const webhook_secret = process.env.WEBHOOK_SECRET
    
  if (!webhook_secret) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

 
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

 
  const payload = await req.json()
  const body = JSON.stringify(payload)

  
  const wh = new Webhook(webhook_secret)
  console.log('here');

    let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
      console.log('signed');
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

    console.log('checking evt type');

  if (evt.type === 'user.created') {
    const { id, email_addresses } = evt.data;

    if (!id || !email_addresses) {
      return new Response('Error occurred -- missing data', { status: 400 });
    }

    const user = {
      id: id,
      email: email_addresses[0].email_address
    }

    await createUser(user);
  }
  return new Response('', { status: 200 })
}