
/** Comprueba las credenciales y establece una sesión autenticada. */
export function loginController(login) {
  return async (req, res, next) => {
    try {
      const user = await login(req.body);

      // Regenerar la sesión para evitar la fijación de sesiones.
      req.session.regenerate((error) => {
        if (error) return next(error);

        // Guardar únicamente los datos necesarios para identificar al usuario.
        req.session.userId = user.id;
        req.session.rol = user.rol;

        // Confirmar que la sesión se ha almacenado antes de responder.
        req.session.save((saveError) => {
          if (saveError) return next(saveError);

          return res.status(200).json({
            message: 'Inicio de sesión correcto.',
            user,
          });
        });
      });
    } catch (error) {
      next(error);
    }
  };
}
