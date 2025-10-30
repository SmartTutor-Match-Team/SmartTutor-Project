import prisma from '$lib/server/prisma';
import type { Actions } from './$types';
import path from 'path';
import fs from 'fs';
import { S3_BUCKET } from '$env/static/private';
import { uploadProfileImage } from '$lib/server/s3';

export const actions: Actions = {
    edit: async ({ request, locals }) => {
        const formData = await request.formData();
        
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const subject = formData.get('subject') as string;
        const hourlyRate = parseFloat(formData.get('hourlyRate') as string);
        const bio = formData.get('bio') as string;
        const profileImage = formData.get('profileImage') as File;

        if (!name || !email || !subject || isNaN(hourlyRate) || !bio) {
            return { success: false, message: 'Invalid input' };
        }
        
        let urlPath: string | null = null;
        if (profileImage && profileImage.size > 0) {
            // If S3 is configured, upload to S3; otherwise save locally in static/tutorProfile
            if (S3_BUCKET) {
                try {
                    urlPath = await uploadProfileImage(profileImage);
                } catch (err) {
                    console.error('Failed to upload profile image to S3:', err);
                    return { success: false, message: 'Failed to upload image' };
                }
            } else {
                const uploadsDir = path.join(process.cwd(), 'static', 'tutorProfile');
                if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

                const arrayBuffer = await profileImage.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileName = `${Date.now()}-${profileImage.name}`;
                const filePath = path.join(uploadsDir, fileName);

                try {
                    fs.writeFileSync(filePath, buffer);
                } catch (err) {
                    console.error('Failed to write uploaded file to disk:', err);
                    return { success: false, message: 'Failed to save image' };
                }

                urlPath = `/tutorProfile/${fileName}`;
            }
        } else {
            urlPath = locals.profile?.profileImageUrl || null;
        }

        try {
            const user = await prisma.user.update({
                where: { id: locals.user?.id },
                data: { name, email }
            });
            
            const existingProfile = await prisma.tutorProfile.findFirst({
                where: { id: locals.profile?.id }
            });

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
                        userId: user.id,
                        subject,
                        hourlyRate,
                        bio,
                        ...(urlPath ? { profileImageUrl: urlPath } : {})
                    }
                });
            }

            // Update locals
            locals.user = user;
            locals.profile = await prisma.tutorProfile.findFirst({
                where: { userId: user.id }
            });
        } catch (error) {
            console.error('Error updating user profile:', error);
            return { success: false, message: 'Error updating profile' };
        }

        return { success: true, message: 'Profile updated successfully' };
    }
};