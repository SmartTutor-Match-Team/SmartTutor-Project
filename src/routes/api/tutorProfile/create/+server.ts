import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs';
import prisma from '$lib/server/prisma';
import { S3_BUCKET } from '$env/static/private';
import { uploadProfileImage } from '$lib/server/s3';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let file: File | null = null;
    let bio: string | undefined;
    let subject: string | undefined;
    let hourlyRate: number | undefined;
    let userId: string | undefined;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      bio = json.bio;
      subject = json.subject;
      hourlyRate = json.hourlyRate !== undefined ? Number(json.hourlyRate) : undefined;
      userId = json.userId;
    } else {
      const form = await request.formData();
      file = form.get('image') as File | null;
      bio = form.get('bio') as string;
      subject = form.get('subject') as string;
      hourlyRate = parseFloat(form.get('hourlyRate') as string);
      userId = form.get('userId') as string;
    }

    let urlPath: string | null = null;
    if (file && file.size > 0) {
      if (S3_BUCKET) {
        try {
          urlPath = await uploadProfileImage(file);
        } catch (err) {
          console.error('[POST /api/tutorProfile/create] S3 upload failed:', err);
          return new Response(JSON.stringify({ message: 'Failed to upload image' }), { status: 500 });
        }
      } else {
        const uploadsDir = path.join(process.cwd(), 'static', 'tutorProfile');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);
        try {
          fs.writeFileSync(filePath, buffer);
          urlPath = `/tutorProfile/${fileName}`;
        } catch (err) {
          console.error('[POST /api/tutorProfile/create] write file failed:', err);
          return new Response(JSON.stringify({ message: 'Failed to save image' }), { status: 500 });
        }
      }
    }

    if (!userId || !subject || hourlyRate === undefined || Number.isNaN(hourlyRate)) {
      return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 400 });
    }

    const profile = await prisma.tutorProfile.create({
      data: {
        bio: bio || '',
        subject,
        hourlyRate,
        profileImageUrl: urlPath,
        user: { connect: { id: userId } }
      }
    });

    cookies.set('profileId', profile.id, { path: '/', httpOnly: true });

    return new Response(JSON.stringify({ message: 'Profile created', profileId: profile.id, url: urlPath }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/tutorProfile/create] error:', err);
    return new Response(JSON.stringify({ message: 'Failed to create profile' }), { status: 500 });
  }
};
