const prisma = require('../config/db');

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { lastUpdated: 'desc' } });
    res.json(projects);
  } catch (e) {
    next(e);
  }
};

const upsertProject = async (req, res) => {
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

const addReport = async (req, res) => {
  const { projectId, report } = req.body;
  if (!projectId || !report) {
    return res.status(400).json({ error: '필수 데이터 누락' });
  }

  try {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });

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
      // req.files에는 업로드된 파일 배열이 들어있음
      // finalReport.photos 배열의 url을 실제 서버 경로로 교체
      finalReport.photos = finalReport.photos.map((p, idx) => {
        const file = req.files[idx];
        return file ? { ...p, url: `/uploads/${file.filename}` } : p;
      });
    }

    const updatedReports = [finalReport, ...currentReports];

    const completedSiteIds = new Set(updatedReports.map(r => r.siteId).filter(Boolean));
    const totalSites = currentSites.length;
    
    let newProgress = 0;
    if (totalSites > 0) {
      const completedCount = currentSites.filter(site => completedSiteIds.has(site.id)).length;
      newProgress = Math.round((completedCount / totalSites) * 100);
    } else {
        newProgress = 0;
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
