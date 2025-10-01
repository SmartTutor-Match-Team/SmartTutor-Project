import prisma from '$lib/server/prisma';
import type { Actions } from './$types';
import path, { parse } from 'path';
import fs, { fdatasync } from 'fs';

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
        
        let profileImageUrl: string | null = null;
        let urlPath: string | null = null;
        if (profileImage && profileImage.size > 0) {
            // Simulate image upload and get URL (replace with actual upload logic)
            profileImageUrl = `/tutorProfile/${Date.now()}-${profileImage.name}`;

            if (!fs.existsSync('static/tutorProfile')) {
                fs.mkdirSync('static/tutorProfile', { recursive: true });
            }

            const arrayBuffer = await profileImage.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(`static${profileImageUrl}`, buffer);

            urlPath = profileImageUrl;
        } else {
            profileImageUrl = locals.profile?.profileImageUrl || null;
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
                        ...(profileImageUrl ? { profileImageUrl: urlPath } : {})
                    }
                });
            } else {
                await prisma.tutorProfile.create({
                    data: {
                        userId: user.id,
                        subject,
                        hourlyRate,
                        bio,
                        ...(profileImageUrl ? { profileImageUrl: urlPath } : {})
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