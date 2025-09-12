import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
    const { availabilityId, studentId } = await request.json();
    
    // ตรวจสอบว่า availabilityId มีอยู่จริงและยังว่างอยู่
    const availability = await prisma.availability.findUnique({
        where: { id: availabilityId },
        include: { bookings: true }
    });

    if (!availability) {
        return json({ error: 'Availability not found' }, { status: 404 });
    }

    // ตรวจสอบจำนวนการจองที่มีสถานะ 'BOOKED' ใน availability นี้ เทียบกับ maxStudents
    const bookedCount = availability.bookings.filter(b => b.status === 'BOOKED').length;
    if (bookedCount >= availability.maxStudents) {
        return json({ error: 'No available slots' }, { status: 400 });
    }

    // ถ้าเคยจองแล้ว ตรวจสอบสถานะการจอง
    const existingBooking = await prisma.booking.findFirst({
        where: {
            availabilityId,
            studentId
        }
    });

    if (existingBooking) {
        if (existingBooking.status === 'BOOKED') {
            return json({ error: 'You have already booked this slot' }, { status: 400 });
        } else if (existingBooking.status === 'CANCELLED') {
            // อนุญาตให้จองใหม่ได้
        } else if (existingBooking.status === 'COMPLETED') {
            return json({ error: 'You have already completed a booking for this slot' }, { status: 400 });
        }
    }

    // สร้างการจองใหม่
    const newBooking = await prisma.booking.create({
        data: {
            availabilityId,
            studentId,
            status: 'BOOKED'
        }
    });

    return json({ message: 'Booking successful', booking: newBooking });
};
