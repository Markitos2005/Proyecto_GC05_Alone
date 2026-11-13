/** Perfil del usuario autenticado (SCRUM-93 §6 y §7). req.user lo establece requireAuth. */
export function profileController(profiles) {
  return {
    get: async (req, res, next) => {
      try {
        res.status(200).json(await profiles.get(req.user.id));
      } catch (error) {
        next(error);
      }
    },
    update: async (req, res, next) => {
      try {
        const profile = await profiles.update(req.user.id, req.body);
        res.status(200).json({ message: 'Perfil actualizado correctamente', profile });
      } catch (error) {
        next(error);
      }
    },
  };
}
