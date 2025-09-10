import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { name, subject, price, availability, rating } = await request.json();

    let tutors;

    if (availability === 'true') {
        tutors = await prisma.tutorProfile.findMany({
            where: {
                subject: subject || undefined,
                user: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                availabilities: {
                    some: {
                        date: { gt: new Date() },
                        startTime: { gt: new Date() }
                    }
                }
            },
            orderBy: [{ hourlyRate: price === 'asc' ? 'asc' : 'desc' }],
            include: { user: true, availabilities: true }
        });
    } else if (availability === 'false') {
        tutors = await prisma.tutorProfile.findMany({
            where: {
                subject: subject || undefined,
                user: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                },
                OR: [
                    // ไม่มี availability เลย
                    { availabilities: { none: {} } },

                    // หรือ availability ที่เลยเวลาไปแล้ว
                    {
                        availabilities: {
                            every: {
                                OR: [
                                    { date: { lt: new Date() } },
                                    { endTime: { lt: new Date() } }
                                ]
                            }
                        }
                    }
                ]
            },
            orderBy: [{ hourlyRate: price === 'asc' ? 'asc' : 'desc' }],
            include: { user: true, availabilities: true }
        });
    } else {
        // ไม่เลือก filter availability (all tutors)
        tutors = await prisma.tutorProfile.findMany({
            where: {
                subject: subject || undefined,
                user: {
                    name: {
                        contains: name,
                        mode: 'insensitive'
                    }
                }
            },
            orderBy: [{ hourlyRate: price === 'asc' ? 'asc' : 'desc' }],
            include: { user: true, availabilities: true }
        });
    }

    return json({ tutors });
};
