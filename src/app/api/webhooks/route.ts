import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, updateUser } from '@/lib/controller/users';

export async function POST(req: Request) {
 
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(process.env.CLERK_SIGNING_SECRET || '');

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

 
  const eventType = evt.type;
  console.log("eventType", eventType);
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const user = await createUser({
      clerkId: id,
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`.trim(),
      imageUrl: image_url,
    });

    return new Response(JSON.stringify({ user }), {
      status: 201,
    });
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const user = await updateUser(id, {
      email: email_addresses[0].email_address,
      name: `${first_name} ${last_name}`.trim(),
      imageUrl: image_url,
    });

    return new Response(JSON.stringify({ user }), {
      status: 200,
    });
  }

  if (eventType === 'user.deleted') {

    return new Response(null, {
      status: 204,
    });
  }

  return new Response('', { status: 200 });
} 


