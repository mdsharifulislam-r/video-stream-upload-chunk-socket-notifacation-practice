import { Request, Response } from "express";
import { join } from "path";
import multer from "multer";
import fs from "fs";
import path from "path";
const sendVideoInStream = (req: Request, res: Response):any => {
    const filePath = join(process.cwd(), "uploads", "video.mp4");

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Video file not found" });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
        res.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": fileSize,
        });
        fs.createReadStream(filePath).pipe(res);
        return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);
    
    if (start >= fileSize || end >= fileSize) {
        return res.status(416).json({ message: "Requested range not satisfiable" });
    }

    const contentLength = end - start + 1;
    res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.pipe(res);
};
const UPLOAD_DIR = join(process.cwd(), "uploads");
const stremUploadVideo = (chunkIndex: number, totalChunks: number,filename: string,file:any)=>{
    const chunkPath = path.join(UPLOAD_DIR, `${filename}.part${chunkIndex}`);
    fs.renameSync(file.path, chunkPath);

    console.log(`Chunk ${chunkIndex}/${totalChunks} received for ${filename}`);

    // Check if all chunks are received
    const chunks = fs.readdirSync(UPLOAD_DIR).filter(file => file.startsWith(filename));
    if (chunks.length === Number(totalChunks)) {
        const filePath = path.join(UPLOAD_DIR, filename);
        const writeStream = fs.createWriteStream(filePath);

        for (let i = 0; i < totalChunks; i++) {
            const chunkFile = path.join(UPLOAD_DIR, `${filename}.part${i}`);
            const data = fs.readFileSync(chunkFile);
            writeStream.write(data);
            fs.unlinkSync(chunkFile); // Remove chunk after merging
        }
        writeStream.end();
    }

}


export const VideoService={
    sendVideoInStream,
    stremUploadVideo
}