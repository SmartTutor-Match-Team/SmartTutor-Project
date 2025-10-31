# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
### SmartTutor-Project — setup & run

คู่มือสั้น ๆ สำหรับการตั้งค่าและรันโปรเจคบนเครื่องหรือบนเซิร์ฟเวอร์ (เช่น EC2)

ก่อนเริ่ม: โปรเจคใช้ pnpm, Prisma, SvelteKit (adapter-node) และ S3 (optional) สำหรับเก็บรูปภาพ

## ขั้นตอนหลัก

1) สร้างไฟล์ `.env` แล้วตั้งค่า AWS / DATABASE / JWT ตามต้องการ (อย่า commit ไฟล์นี้)

ตัวอย่าง `.env` (แก้เป็นค่าจริงของคุณ):

```properties
DATABASE_URL="postgres://<user>:<pass>@<host>:5432/<db>?sslmode=require"
JWT_SECRET="<your_jwt_secret_at_least_32_chars>"
JWT_EXPIRES_IN="7d"

# S3 (ถ้าใช้)
AWS_REGION=us-east-1
S3_BUCKET=my-unique-static-files-bucket-12345
AWS_ACCESS_KEY_ID=AKIA......
AWS_SECRET_ACCESS_KEY=......
# ถ้าใช้ temporary STS credentials ต้องตั้งด้วย
AWS_SESSION_TOKEN=......

# NODE_ENV=production
```

2) ติดตั้ง dependencies

```bash
pnpm install
```

3) สร้าง Prisma client

```bash
pnpm prisma generate
# หรือ
pnpm exec prisma generate
```

4) ซิงค์ schema กับฐานข้อมูล (ถ้าใช้ `db push`)

```bash
pnpm exec prisma db push
# หรือ (ตัวเลือก)
# pnpx prisma db push
```

5) Build และรัน

```bash
pnpm build
node build
```

## ทดสอบและ debug

- ดู log ของ server เพื่อเห็น console.log ที่เราเพิ่มไว้ (เช่น `[createProfile]`, `[POST /availability]`)
- ทดสอบ S3 ด้วย AWS CLI ถ้าจำเป็น:

```bash
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...   # ถ้ามี
export AWS_REGION=us-east-1

aws s3 ls s3://my-unique-static-files-bucket-12345 --region us-east-1
```

ถ้าสำเร็จ แปลว่า creds/permission ของ S3 ถูกต้อง

## ปัญหาที่อาจเจอ & การแก้ไขด่วน

- `InvalidAccessKeyId` / S3 403: ตรวจ `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` และ `AWS_SESSION_TOKEN` (ถ้าใช้ temporary creds). แนะนำใช้ IAM Role บน EC2 แทนคีย์ถาวร
- Prisma query engine binary mismatch: รัน `pnpm exec prisma generate` บนเครื่องเป้าหมาย (EC2) หรือเพิ่ม `binaryTargets` ใน `prisma/schema.prisma` (โปรเจคนี้ได้เพิ่ม `linux-openssl-3.0.x` แล้ว)
- ALB 403: ทดสอบ direct ไปที่ instance (`curl http://127.0.0.1:PORT/...`) ถ้าตรง instance ตอบ 200 แต่ผ่าน ALB 403 ให้ตรวจ ALB listener rules / WAF / security groups

## ต่อยอด

- ถ้าต้องการ ผมสามารถเพิ่ม `GET /api/health` ที่ตรวจ DB + S3 ให้เรียกตรวจได้ง่าย ๆ
- ผมสามารถช่วยแก้โค้ดให้ตรวจ auth (จาก `locals.user`) เพื่อป้องกันการแก้ไขข้อมูลของคนอื่นได้

หากติดปัญหา ให้คัดลอก log (จาก server หรือ `curl -v`) มาให้ผม ผมช่วยวิเคราะห์ต่อได้เลย
