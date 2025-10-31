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
    let name: string | undefined;
    let email: string | undefined;
    let subject: string | undefined;
    let hourlyRate: number | undefined;
    let bio: string | undefined;
    let profileId: string | undefined;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      name = json.name;
      email = json.email;
      subject = json.subject;
      hourlyRate = json.hourlyRate !== undefined ? Number(json.hourlyRate) : undefined;
      bio = json.bio;
      profileId = json.profileId;
    } else {
      const form = await request.formData();
      file = form.get('profileImage') as File | null;
      name = form.get('name') as string;
      email = form.get('email') as string;
      subject = form.get('subject') as string;
      hourlyRate = parseFloat(form.get('hourlyRate') as string);
      bio = form.get('bio') as string;
      profileId = form.get('profileId') as string;
    }

    if (!profileId || !name || !email || !subject || hourlyRate === undefined || Number.isNaN(hourlyRate) || !bio) {
      return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 400 });
    }

    let urlPath: string | null = null;
    if (file && file.size > 0) {
      if (S3_BUCKET) {
        try {
          urlPath = await uploadProfileImage(file);
        } catch (err) {
          console.error('[POST /api/tutorProfile/edit] S3 upload failed:', err);
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
          console.error('[POST /api/tutorProfile/edit] write file failed:', err);
          return new Response(JSON.stringify({ message: 'Failed to save image' }), { status: 500 });
        }
      }
    }

    // update user
    const user = await prisma.user.update({ where: { id: cookies.get('userId') || '' }, data: { name, email } }).catch(() => null);

    const existingProfile = await prisma.tutorProfile.findFirst({ where: { id: profileId } });

    if (existingProfile) {
      await prisma.tutorProfile.update({
        where: { id: existingProfile.id },
        data: {
          subject,
          hourlyRate,
          bio,
          ...(urlPath ? { profileImageUrl: urlPath } : {})
        }
      });
    } else {
      await prisma.tutorProfile.create({
        data: {
          userId: cookies.get('userId') || '',
          subject,
          hourlyRate,
          bio,
          ...(urlPath ? { profileImageUrl: urlPath } : {})
        }
      });
    }

    return new Response(JSON.stringify({ message: 'Profile updated', profileImageUrl: urlPath }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/tutorProfile/edit] error:', err);
    return new Response(JSON.stringify({ message: 'Failed to update profile' }), { status: 500 });
  }
};
