import * as virementService from '../../services/virementService.js';

export const createVirement = async (req, res) => {
    try {
        const clientId = req.session.user.id;
        const { sourceAccountId, destinationAccountId, amount, motif } = req.body;

        const virement = await virementService.createVirement(
            clientId,
            sourceAccountId,
            destinationAccountId,
            amount,
            motif
        );

        res.status(201).json(virement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getVirementHistory = async (req, res) => {
    try {
        const history = await virementService.getVirementHistory(req.session.user.id);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};