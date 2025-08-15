// place files you want to import through the `$lib` alias in this folder.
import { PrismaClient } from '../../../prisma/src/generated/prisma/client';
import { DATABASE_URL } from '$env/static/private';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient({
    datasourceUrl: DATABASE_URL
}).$extends(withAccelerate());

export default prisma;
