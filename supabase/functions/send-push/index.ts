// SPRINT 0: Send Push Notification via Firebase Admin SDK
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { cert, initializeApp } from 'https://esm.sh/firebase-admin@12.0.0/app';
import { getMessaging } from 'https://esm.sh/firebase-admin@12.0.0/messaging';

interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

serve(async (req) => {
  const serviceAccount = JSON.parse(Deno.env.get('FIREBASE_SERVICE_ACCOUNT') || '{}');
  if (!serviceAccount.project_id) {
    return Response.json({ error: 'Firebase service account not configured' }, { status: 500 });
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const messaging = getMessaging(app);

  const push: PushMessage = await req.json();

  const message = {
    token: push.token,
    notification: {
      title: push.title,
      body: push.body,
    },
    data: push.data || {},
  };

  try {
    const response = await messaging.send(message);
    return Response.json({ success: true, messageId: response });
  } catch (error) {
    return Response.json({ error: error.message, status: 500 }, { status: 500 });
  }
});
