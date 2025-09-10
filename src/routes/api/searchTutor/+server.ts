import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { name, subject, availability, price, rating } = await request.json();

    // Build where clause base
    const whereClause: any = {
        user: {
            name: {
                contains: name || '',
                mode: 'insensitive'
            }
        },
        subject: subject || undefined
    };

    // Availability filter
    if (availability === 'true') {
        whereClause.availabilities = {
            some: {
                date: { gt: new Date() },
                endTime: { gt: new Date() }
            }
        };
    } else if (availability === 'false') {
        whereClause.OR = [
            { availabilities: { none: {} } },
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
        ];
    }

    // ดึง avgRating ของแต่ละ tutorProfile
    const ratingAgg = await prisma.review.groupBy({
        by: ['tutorProfileId'],
        _avg: { rating: true }
    }) as { tutorProfileId: string; _avg: { rating: number | null } }[];

    // ดึง tutorProfile ตาม whereClause
    type TutorWithAvgRating = Awaited<ReturnType<typeof prisma.tutorProfile.findMany>>[number] & { avgRating: number; hourlyRate: number };

    let tutors = await prisma.tutorProfile.findMany({
        where: whereClause,
        include: {
            user: true,
            availabilities: true
        }
    });

    // เติม avgRating ให้แต่ละ tutor (0 ถ้าไม่มี review)
    let tutorsWithAvgRating: TutorWithAvgRating[] = tutors.map(tutor => {
        const agg = ratingAgg.find(r => r.tutorProfileId === tutor.id);
        return {
            ...tutor,
            avgRating: agg?._avg.rating ?? 0
        };
    });

    // Sort combine: rating ก่อน → price
    if (rating === 'desc') {
        tutorsWithAvgRating.sort((a, b) => {
            const ratingDiff = b.avgRating - a.avgRating; // desc
            if (ratingDiff !== 0) return ratingDiff;
            
            // ถ้า rating เท่ากัน sort price
            return price === 'asc'
            ? a.hourlyRate - b.hourlyRate
            : b.hourlyRate - a.hourlyRate;
        });
    } else if (rating === 'asc') {
        tutorsWithAvgRating.sort((a, b) => {
            const ratingDiff = a.avgRating - b.avgRating; // asc
            if (ratingDiff !== 0) return ratingDiff;

            // ถ้า rating เท่ากัน sort price
            return price === 'asc'
            ? a.hourlyRate - b.hourlyRate
            : b.hourlyRate - a.hourlyRate;
        });
    } else {
        // ถ้าไม่ sort rating ก็ sort price อย่างเดียว
        tutorsWithAvgRating.sort((a, b) => {
            return price === 'asc'
            ? a.hourlyRate - b.hourlyRate
            : b.hourlyRate - a.hourlyRate;
        });
    }

    return json({ tutors: tutorsWithAvgRating });
};
