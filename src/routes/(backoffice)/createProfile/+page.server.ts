import type { Actions } from './$types';
import path from 'path';
import fs from 'fs';
import prisma from '$lib/server/prisma';
import { S3_BUCKET } from '$env/static/private';
import { uploadProfileImage } from '$lib/server/s3';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file || !(file instanceof File)) {
            return { success: false, message: 'No image file uploaded' };
        }

        // If S3_BUCKET is configured, upload to S3. Otherwise fallback to writing into static/tutorProfile
        let urlPath: string;
        if (S3_BUCKET) {
            // uploadProfileImage expects a File-like object and returns the full S3 URL
            try {
                urlPath = await uploadProfileImage(file);
            } catch (err) {
                console.error('Failed to upload profile image to S3:', err);
                return { success: false, message: 'Failed to upload image' };
            }
        } else {
            // กำหนดโฟลเดอร์เก็บไฟล์ (local fallback)
            const uploadsDir = path.join(process.cwd(), 'static', 'tutorProfile');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileName = `${Date.now()}-${file.name}`;
            const filePath = path.join(uploadsDir, fileName);

            try {
                fs.writeFileSync(filePath, buffer);
            } catch (err) {
                console.error('Failed to write uploaded file to disk:', err);
                return { success: false, message: 'Failed to save image' };
            }

            urlPath = `/tutorProfile/${fileName}`;
        }

        const hourlyRate = parseFloat(formData.get('hourlyRate') as string);

        try {
            const userIdFromForm = formData.get('userId') as string;
            console.log('[createProfile] userIdFromForm:', userIdFromForm);

            const profile = await prisma.tutorProfile.create({
                data: {
                    bio: formData.get('bio') as string,
                    subject: formData.get('subject') as string,
                    hourlyRate,
                    profileImageUrl: urlPath,
                    user: {
                        connect: { id: userIdFromForm }
                    }
                }
            });

            cookies.set('profileId', profile.id, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return {
                success: true,
                message: 'File uploaded successfully',
                data: { profileId: profile.id }
            };
        } catch (err) {
            console.error('[createProfile] failed to create profile:', err);
            return { success: false, message: 'Failed to create profile' };
        }
    }
};
