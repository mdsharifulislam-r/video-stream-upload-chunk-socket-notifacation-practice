import express, { Request, Response } from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { SocketService } from './services/socket/socket.service';
import { VideoService } from './services/video/video.servie';
import multer from "multer";
import { join } from "path";
import fs from "fs";
import cors from "cors"

const app = express();
const port = 3000;
const UPLOAD_DIR = join(__dirname, "uploads");

// Ensure uploads directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });
const server = http.createServer(app)
const io = new Server(server,{
    cors: {
        origin: '*',
    }
})
// Middleware to handle JSON payloads
app.use(express.json());
app.use(cors())
// Sample route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript with Express!');
});

app.get("/video",VideoService.sendVideoInStream)
app.post("/video", upload.single("chunk"), async (req: Request, res: Response) => {
  const { chunkIndex, totalChunks, filename } = req.body;
  const file = req.file
  await VideoService.stremUploadVideo(chunkIndex,totalChunks,filename,file)
  res.status(200).send('Video chunk uploaded successfully');

})
SocketService(io)
// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
