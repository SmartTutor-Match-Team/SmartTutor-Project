import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export async function load() {
    // ดึง avgRating ของแต่ละ tutorProfile
    const ratingAgg = await prisma.review.groupBy({
        by: ['tutorProfileId'],
        _avg: { rating: true }
    }) as { tutorProfileId: string; _avg: { rating: number | null } }[];

    // ดึง tutorProfile ตาม whereClause
    type TutorWithAvgRating = Awaited<ReturnType<typeof prisma.tutorProfile.findMany>>[number] & { avgRating: number; hourlyRate: number };

    let tutors = await prisma.tutorProfile.findMany({
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
    tutorsWithAvgRating.sort((a, b) => {
        const ratingDiff = b.avgRating - a.avgRating; // desc
        if (ratingDiff !== 0) return ratingDiff;
        
        // ถ้า rating เท่ากัน sort price
        return a.hourlyRate - b.hourlyRate; // asc
    });

    // จำกัดแค่ 4 คน
    tutorsWithAvgRating = tutorsWithAvgRating.slice(0, 4);

    return { our_tutor: tutorsWithAvgRating }
}
