import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { auth } from "@clerk/nextjs/server"

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    })
}

export async function GET() {
    try {
        // Verificar configuración de S3
        const headCommand = new HeadBucketCommand({
            Bucket: process.env.AWS_BUCKET_NAME!
        })
        
        await s3Client.send(headCommand)
        
        return NextResponse.json({ 
            status: "S3 configurado correctamente",
            bucket: process.env.AWS_BUCKET_NAME,
            region: process.env.AWS_REGION
        })
    } catch (error) {
        console.error("[S3_TEST_ERROR]", error)
        return NextResponse.json({ 
            status: "Error en configuración de S3",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 })
    }
}

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

        // Verificar variables de entorno
        console.log("Variables de entorno:", {
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_BUCKET_NAME,
            hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
            hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
        })

        // Generamos un nombre único para el archivo
        const uniqueFileName = `${userId}/${Date.now()}-${fileName}`
        console.log("Nombre único del archivo:", uniqueFileName)

        // Creamos el comando para subir el archivo
        const putCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uniqueFileName,
            ContentType: fileType,
        })

        // Creamos el comando para leer el archivo
        const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uniqueFileName,
        })

        // Generamos las URLs firmadas
        const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 })
        const readUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 86400 }) // 24 horas
        
        // Construimos la URL pública del archivo (usando el endpoint correcto de S3)
        const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`
        
        console.log("UploadUrl:", uploadUrl)
        console.log("ReadUrl:", readUrl)
        console.log("PublicUrl:", publicUrl)
        
        return NextResponse.json({ 
            uploadUrl, 
            url: publicUrl,
            readUrl, // URL firmada para leer (como respaldo)
            fileName: uniqueFileName 
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        })
    } catch (error) {
        console.error("[UPLOAD_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
} 