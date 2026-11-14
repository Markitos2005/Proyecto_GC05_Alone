/** US-006. Cambio de contraseña del usuario autenticado. req.user lo establece requireAuth. */
export function passwordController(passwords) {
  return {
    change: async (req, res, next) => {
      try {
        await passwords.change(req.user.id, req.sessionID, req.body);
        // AC-10: respuesta comprensible, sin contraseñas ni datos internos.
        res.status(200).json({
          message: 'Contraseña actualizada correctamente. Se han cerrado tus demás sesiones abiertas.',
        });
      } catch (error) {
        next(error);
      }
    },
  };
}
