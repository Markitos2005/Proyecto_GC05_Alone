/** Endpoints sin autenticación: la autorización del cambio es el token del correo. */
export function recoveryController(service, action) {
  return async (req, res, next) => {
    if (!service) return res.status(503).json({ message: 'El servicio de recuperación no está disponible.' });
    try {
      return res.status(200).json(await service[action](req.body));
    } catch (error) {
      return next(error);
    }
  };
}
