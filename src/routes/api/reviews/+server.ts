import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { bookingId, reviewerId, tutorProfileId, rating, comment } = await request.json();

    // ตรวจสอบว่า bookingId มีอยู่จริงและสถานะเป็น 'COMPLETED'
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
    });

    if (!booking) {
        return json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'COMPLETED') {
        return json({ error: 'Cannot review a booking that is not completed' }, { status: 400 });
    }

    // ตรวจสอบว่า studentId ตรงกับ booking.studentId
    // สมมติว่าเรามี studentId จาก session หรือ token (ในที่นี้สมมติเป็น 'student123')
    const studentId = booking.studentId; // เปลี่ยนตามการดึงข้อมูลจริง

    if (studentId !== booking.studentId) {
        return json({ error: 'You can only review your own bookings' }, { status: 403 });
    }
    
    // ตรวจสอบว่ามีการรีวิวสำหรับ bookingId นี้แล้วหรือไม่
    const existingReview = await prisma.review.findFirst({
        where: { bookingId }
    });

    if (existingReview) {
        return json({ error: 'You have already reviewed this booking' }, { status: 400 });
    }

    // สร้างรีวิวใหม่
    const newReview = await prisma.review.create({
        data: {
            bookingId,
            reviewerId,
            tutorProfileId,
            rating,
            comment
        }
    });

    return json({ message: 'Review submitted successfully', review: newReview });
};
