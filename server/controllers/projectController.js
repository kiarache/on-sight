const prisma = require('../config/db');
const { put } = require('@vercel/blob');

const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { lastUpdated: 'desc' } });
    res.json(projects);
  } catch (e) {
    next(e);
  }
};

const upsertProject = async (req, res, next) => {
  const p = req.body;
  try {
    // 진척도 계산: 완료 개소 / 프로젝트 전체 개소
    let progress = 0;
    const sites = Array.isArray(p.sites) ? p.sites : (typeof p.sites === 'string' ? JSON.parse(p.sites) : []);
    const reports = Array.isArray(p.reports) ? p.reports : (typeof p.reports === 'string' ? JSON.parse(p.reports) : []);
    
    if (sites.length > 0) {
      const completedSiteIds = new Set(reports.map(r => r.siteId).filter(Boolean));
      const completedCount = sites.filter(site => completedSiteIds.has(site.id)).length;
      progress = Math.round((completedCount / sites.length) * 100);
    }

    const project = await prisma.project.upsert({
      where: { id: p.id },
      update: { ...p, progress },
      create: { ...p, progress }
    });
    res.json(project);
  } catch (e) {
    e.status = 400;
    next(e);
  }
};

const addReport = async (req, res, next) => {
  const { projectId, report } = req.body;
  if (!projectId || !report) {
    const err = new Error('필수 데이터 누락');
    err.status = 400;
    return next(err);
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      const err = new Error('프로젝트를 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    }

    // Handle reports JSON
    let currentReports = project.reports;
    if (typeof currentReports === 'string') {
        try { currentReports = JSON.parse(currentReports); } catch(e) { currentReports = []; }
    }
    if (!Array.isArray(currentReports)) currentReports = [];

    // Handle sites JSON to calculate progress
    let currentSites = project.sites;
    if (typeof currentSites === 'string') {
        try { currentSites = JSON.parse(currentSites); } catch(e) { currentSites = []; }
    }
    if (!Array.isArray(currentSites)) currentSites = [];

    // 파일 업로드 처리
    let finalReport = typeof report === 'string' ? JSON.parse(report) : report;
    
    if (req.files && req.files.length > 0) {
      // Vercel Blob 업로드 처리 (Multer memoryStorage 내 데이터를 사용)
      const uploadPromises = req.files.map(async (file, idx) => {
        const blob = await put(`reports/${Date.now()}-${file.originalname}`, file.buffer, {
          access: 'public',
        });
        return { index: idx, url: blob.url };
      });

      const uploadedResults = await Promise.all(uploadPromises);
      
      // finalReport.photos 배열의 url을 Vercel Blob URL로 교체
      finalReport.photos = finalReport.photos.map((p, idx) => {
        const result = uploadedResults.find(r => r.index === idx);
        return result ? { ...p, url: result.url } : p;
      });
    }

    const updatedReports = [finalReport, ...currentReports];

    const completedSiteIds = new Set(updatedReports.map(r => r.siteId).filter(Boolean));
    const totalSites = currentSites.length;
    
    let newProgress = 0;
    if (totalSites > 0) {
      const completedCount = currentSites.filter(site => completedSiteIds.has(site.id)).length;
      newProgress = Math.round((completedCount / totalSites) * 100);
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        reports: updatedReports, 
        progress: newProgress,
        lastUpdated: new Date()
      }
    });
    console.log(`[PROGRESS UPDATE] Project: ${projectId}, Progress: ${newProgress}%`);
    res.json(updatedProject);
  } catch (e) {
    next(e);
  }
};

module.exports = { getProjects, upsertProject, addReport };
