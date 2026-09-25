import * as adminStatsService from '../services/adminStatsService.js';




export const getPlatformStats = async (req, res) => {
    try {
        const stats = await adminStatsService.getPlatformGlobalStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




export const getVirementsList = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const offset = Number(req.query.offset) || 0;
        const virements = await adminStatsService.getVirementsOverview(limit, offset);
        res.json({ success: true, count: virements.length, data: virements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




export const getDemandesList = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const offset = Number(req.query.offset) || 0;
        const demandes = await adminStatsService.getDemandesOverview(limit, offset);
        res.json({ success: true, count: demandes.length, data: demandes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




export const getReclamationsList = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 100;
        const offset = Number(req.query.offset) || 0;
        const reclamations = await adminStatsService.getReclamationsOverview(limit, offset);
        res.json({ success: true, count: reclamations.length, data: reclamations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};




export const getSupervisionList = async (req, res) => {
    try {
        const charges = await adminStatsService.getSupervisionCharges();
        res.json({ success: true, count: charges.length, data: charges });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
