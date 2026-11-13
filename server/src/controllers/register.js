export function registrationController(register) {
  return async (req, res) => {
    const user = await register(req.body);
    res.status(201).json({ message: 'Usuario registrado correctamente', user });
  };
}
