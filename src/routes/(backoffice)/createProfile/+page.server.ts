import type { Actions } from './$types';
import path, { parse } from 'path';
import fs from 'fs';
import prisma from '$lib/server/prisma';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file || !(file instanceof File)) {
            return { success: false, message: 'No image file uploaded' };
        }

        // กำหนดโฟลเดอร์เก็บไฟล์
        const uploadsDir = path.join(process.cwd(), 'static/tutorProfile');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = path.join(uploadsDir, fileName);

        fs.writeFileSync(filePath, buffer);

        const urlPath = `/tutorProfile/${fileName}`;

        const hourlyRate = parseFloat(formData.get('hourlyRate') as string);

        const profile = await prisma.tutorProfile.create({
            data: {
                bio: formData.get('bio') as string,
                subject: formData.get('subject') as string,
                hourlyRate,
                profileImageUrl: urlPath,
                user: {
                    connect: { id: formData.get('userId') as string }
                }
            }
        });

        cookies.set('profileId', profile.id, {
            path: '/',
            httpOnly: true
        });

        return {
            success: true,
            message: 'File uploaded successfully',
        };
    }
};
