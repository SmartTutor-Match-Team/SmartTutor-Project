import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { availabilityId, comment, role } = await request.json();

    // ตรวจสอบว่า availabilityId มีอยู่จริง
    const availability = await prisma.availability.findUnique({
        where: { id: availabilityId },
        include: { bookings: true }
    });

    if (!availability) {
        return json({ error: 'Availability not found' }, { status: 404 });
    }

    // เช็คว่า role เป็น TUTOR ต้องเป็นเจ้าของ availability นี้ด้วย (ป้องกันติวเตอร์ไปกดยกเลิกคาบของคนอื่น)
    if (role === 'TUTOR') {
        const tutorProfile = await prisma.tutorProfile.findFirst({
            where: { id: availability.tutorId }
        });

        if (!tutorProfile) {
            return json({ error: 'Tutor profile not found' }, { status: 404 });
        }
    }

    // ตรวจสอบว่ามีการจองที่สถานะ 'BOOKED' หรือไม่ ถ้ามีให้ edit status เป็น 'CANCELLED' และเพิ่ม cancelComment
    const bookedBookings = availability.bookings.filter(b => b.status === 'BOOKED');

    if (bookedBookings.length > 0) {
        // ถ้า role เป็น 'ADMIN' หรือ 'TUTOR' ที่เป็นเจ้าของ availability นี้ ให้อนุญาตยกเลิก
        if (role === 'ADMIN' || role === 'TUTOR') {
            await Promise.all(bookedBookings.map(b =>
                prisma.booking.update({
                    where: { id: b.id },
                    data: { status: 'CANCELLED', cancelComment: comment, cancelBy: role }
                })
            ));
        } else {
            return json({ error: 'Cannot cancel availability with booked students' }, { status: 400 });
        }
    }

    // เปลี่ยนสถานะ availability เป็น isCancelled = true
    await prisma.availability.update({
        where: { id: availabilityId },
        data: { isCancelled: true }
    });

    return json({ message: 'Availability cancelled successfully' });
};
