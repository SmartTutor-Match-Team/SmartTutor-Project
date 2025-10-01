import prisma from '$lib/server/prisma';

export async function load({ locals }: { locals: any }) {
    if (!locals.user) {
        return { bookings: [] };
    }
    // get now student count from booking
    const availability = await prisma.availability.findMany({
        where: {
            tutorId: locals.profile.id
        },
        orderBy: [
            { date: 'desc' },
            { startTime: 'asc' }
        ]
    });

    // count booking this availability
    const bookings = await prisma.booking.findMany({
        where: {
            availabilityId: {
                in: availability.map(av => av.id)
            },
            status: 'BOOKED'
        }
    });

    const completeAvailability = await prisma.booking.findMany({
        where: {
            availabilityId: {
                in: availability.map(av => av.id)
            },
            status: 'COMPLETED'
        }
    });

    availability.forEach(av => {
        const isCompleted = completeAvailability.some(ca => ca.availabilityId === av.id);
        (av as any).isCompleted = isCompleted;
    });

    // Map student count to each availability
    const availabilityWithStudentCount = availability.map(av => {
        const studentCount = bookings.filter(b => b.availabilityId === av.id).length;

        // ✅ แปลงเป็น timezone ไทย
        const date = new Date(av.date).toLocaleDateString('th-TH', {
            timeZone: 'Asia/Bangkok'
        });

        const startTime = new Date(av.startTime).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        });

        const endTime = new Date(av.endTime).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        });

        return { ...av, studentCount, date, startTime, endTime };
    });

    // date greater than now
    const now = new Date();
    now.setHours(now.getHours() + 7); // convert to Bangkok time

    const filteredAvailability = availabilityWithStudentCount.filter(av => {
        const [day, month, buddhistYear] = av.date.split("/").map(Number);
        const year = buddhistYear - 543;
        const avDate = new Date(year, month - 1, day, ...av.startTime.split(":").map(Number));
        return avDate >= now;
    });

    return { availability: filteredAvailability };
}