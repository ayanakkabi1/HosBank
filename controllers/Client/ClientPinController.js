import * as clientPinService from '../../services/clientPinService.js';

export const renderPinRequest = (req, res) => {
	res.render('client/pin-request', {
		error: req.query.error || null,
		success: req.query.success || null
	});
};

export const processPinRequest = async (req, res) => {
	try {
		await clientPinService.requestPinRenewal(req.session.user.id);
		res.redirect('/client/pin-request?success=Demande+envoyee+avec+succes');
	} catch (error) {
		res.redirect(`/client/pin-request?error=${encodeURIComponent(error.message)}`);
	}
};
