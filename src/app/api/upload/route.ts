import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@clerk/nextjs/server"

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { fileName, fileType } = await req.json()

        if (!fileName || !fileType) {
            return new NextResponse("Missing required fields", { status: 400 })
        }

        // Generamos un nombre único para el archivo
        const uniqueFileName = `${userId}/${Date.now()}-${fileName}`

        // Creamos el comando para subir el archivo
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uniqueFileName,
            ContentType: fileType,
        })

        // Generamos la URL firmada
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        // Construimos la URL pública del archivo
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`

        return NextResponse.json({ uploadUrl, url })
    } catch (error) {
        console.error("[UPLOAD_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
} 