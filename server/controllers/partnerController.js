const prisma = require('../config/db');

const getPartners = async (req, res, next) => {
  try {
    const partners = await prisma.partner.findMany();
    res.json(partners);
  } catch (e) {
    next(e);
  }
};

const upsertPartner = async (req, res, next) => {
  const p = req.body;
  try {
    const partner = await prisma.partner.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
    res.json(partner);
  } catch(e) {
    e.status = 400;
    next(e);
  }
};

const deletePartner = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 소속 인원 확인
    const partner = await prisma.partner.findUnique({
      where: { id },
      select: { technicians: true }
    });

    if (partner && Array.isArray(partner.technicians) && partner.technicians.length > 0) {
      const err = new Error('소속 인원이 남아있는 협력사는 삭제할 수 없습니다.');
      err.status = 400;
      return next(err);
    }

    await prisma.partner.delete({ where: { id } });
    res.json({ success: true });
  } catch (e) {
    e.status = 400;
    next(e);
  }
};

const getPublicPartners = async (req, res, next) => {
  try {
    const partners = await prisma.partner.findMany({
      select: { id: true, name: true }
    });
    res.json(partners);
  } catch (e) {
    next(e);
  }
};

module.exports = { getPartners, getPublicPartners, upsertPartner, deletePartner };
