const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

// ─── Get All Services ─────────────────────────────────────────────────────────
const getAllServices = async (req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return successResponse(res, 200, 'Services fetched.', services);
  } catch (err) {
    next(err);
  }
};

// ─── Get Service By ID ────────────────────────────────────────────────────────
const getServiceById = async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!service) return errorResponse(res, 404, 'Service not found.');
    return successResponse(res, 200, 'Service fetched.', service);
  } catch (err) {
    next(err);
  }
};

// ─── Create Service (Admin) ───────────────────────────────────────────────────
const createService = async (req, res, next) => {
  try {
    const { name, category, description, icon } = req.body;
    if (!name || !category || !description) {
      return errorResponse(res, 400, 'name, category, and description are required.');
    }

    const service = await prisma.service.create({ data: { name, category, description, icon } });
    return successResponse(res, 201, 'Service created.', service);
  } catch (err) {
    next(err);
  }
};

// ─── Update Service (Admin) ───────────────────────────────────────────────────
const updateService = async (req, res, next) => {
  try {
    const { name, description, icon, is_active } = req.body;
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) return errorResponse(res, 404, 'Service not found.');

    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(icon !== undefined && { icon }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });
    return successResponse(res, 200, 'Service updated.', updated);
  } catch (err) {
    next(err);
  }
};

// ─── Delete Service (Admin) ───────────────────────────────────────────────────
const deleteService = async (req, res, next) => {
  try {
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) return errorResponse(res, 404, 'Service not found.');
    await prisma.service.delete({ where: { id: req.params.id } });
    return successResponse(res, 200, 'Service deleted.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };
