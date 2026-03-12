import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { convertNcm } from 'ncm2mp3';
import JSZip from 'jszip';
import NodeID3 from 'node-id3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

// 确保目录存在
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// 安全删除文件
const safeUnlink = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    console.error('删除文件失败:', filePath, e.message);
  }
};

// 从 MP3 文件中提取专辑封面
const extractAlbumCover = (mp3Path) => {
  try {
    const tags = NodeID3.read(mp3Path);
    if (tags?.image?.imageBuffer) {
      return {
        data: tags.image.imageBuffer.toString('base64'),
        size: tags.image.imageBuffer.length
      };
    }
  } catch (e) {
    console.error('读取专辑封面失败:', e.message);
  }
  return null;
};

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, uniqueSuffix + '-' + originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    if (path.extname(originalname).toLowerCase() === '.ncm') {
      cb(null, true);
    } else {
      cb(new Error('只支持 NCM 文件'));
    }
  }
});

app.use(express.static('public'));

// 转换接口
app.post('/convert', upload.array('ncmFiles', 20), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: '请上传 NCM 文件' });
  }

  const results = [];
  const errors = [];

  for (const file of req.files) {
    const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    
    try {
      console.log('正在转换:', originalname);
      
      const resultPath = await convertNcm(file.path, outputDir + '/');
      safeUnlink(file.path);

      // 提取专辑封面
      const cover = extractAlbumCover(resultPath);
      if (cover) {
        console.log('成功提取专辑封面:', cover.size, 'bytes');
      }

      results.push({
        originalName: originalname,
        filename: path.basename(resultPath),
        downloadUrl: '/download/' + path.basename(resultPath),
        albumCover: cover ? `data:image/jpeg;base64,${cover.data}` : null
      });
    } catch (error) {
      console.error(`转换失败 ${originalname}:`, error.message);
      errors.push({ originalName: originalname, error: error.message });
      safeUnlink(file.path);
    }
  }

  res.json({
    success: results.length > 0,
    message: `成功转换 ${results.length} 个文件，失败 ${errors.length} 个`,
    results,
    errors
  });
});

// 打包下载
app.post('/download-all', express.json(), async (req, res) => {
  const { filenames } = req.body;
  if (!filenames?.length) {
    return res.status(400).json({ error: '没有文件可下载' });
  }

  try {
    const zip = new JSZip();
    const folder = zip.folder('mp3_files');

    for (const filename of filenames) {
      const filePath = path.join(outputDir, filename);
      if (fs.existsSync(filePath)) {
        folder.file(filename, fs.readFileSync(filePath));
      }
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    const zipFilename = 'mp3_files_' + Date.now() + '.zip';

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`
    });
    res.send(zipContent);
  } catch (error) {
    console.error('打包下载失败:', error.message);
    res.status(500).json({ error: '打包下载失败: ' + error.message });
  }
});

// 单个文件下载
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(outputDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  res.download(filePath, req.params.filename, (err) => {
    if (err) console.error('下载错误:', err.message);
    // 1分钟后删除文件
    setTimeout(() => safeUnlink(filePath), 60000);
  });
});

// 音频预览
app.get('/preview/:filename', (req, res) => {
  const filePath = path.join(outputDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const [start, end] = range.replace(/bytes=/, '').split('-').map((v, i) => 
      i === 0 ? parseInt(v, 10) : (v ? parseInt(v, 10) : fileSize - 1)
    );
    const chunksize = end - start + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'audio/mpeg'
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'audio/mpeg'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
