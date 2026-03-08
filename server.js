import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { convertNcm } from 'ncm2mp3';
import JSZip from 'jszip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.ncm') {
      cb(null, true);
    } else {
      cb(new Error('只支持 NCM 文件'));
    }
  }
});

app.use(express.static('public'));

app.post('/convert', upload.array('ncmFiles', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '请上传 NCM 文件' });
    }

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        console.log('正在转换:', file.originalname);
        const resultPath = await convertNcm(file.path, outputDir + '/');
        fs.unlinkSync(file.path);

        results.push({
          originalName: file.originalname,
          filename: path.basename(resultPath),
          downloadUrl: '/download/' + path.basename(resultPath)
        });
      } catch (error) {
        console.error(`转换失败 ${file.originalname}:`, error);
        errors.push({
          originalName: file.originalname,
          error: error.message
        });
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    res.json({
      success: results.length > 0,
      message: `成功转换 ${results.length} 个文件，失败 ${errors.length} 个`,
      results: results,
      errors: errors
    });

  } catch (error) {
    console.error('转换失败:', error);
    if (req.files) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }
    res.status(500).json({ error: '转换失败: ' + error.message });
  }
});

app.post('/download-all', express.json(), async (req, res) => {
  try {
    const { filenames } = req.body;
    if (!filenames || filenames.length === 0) {
      return res.status(400).json({ error: '没有文件可下载' });
    }

    const zip = new JSZip();
    const folder = zip.folder('mp3_files');

    for (const filename of filenames) {
      const filePath = path.join(outputDir, filename);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        folder.file(filename, content);
      }
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    const zipFilename = 'mp3_files_' + Date.now() + '.zip';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    res.send(zipContent);

  } catch (error) {
    console.error('打包下载失败:', error);
    res.status(500).json({ error: '打包下载失败: ' + error.message });
  }
});

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(outputDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('下载错误:', err);
    }
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 60000);
  });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
