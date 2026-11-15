export function avisoController(service) {
  return {
    options: async (_req, res, next) => {
      try { res.status(200).json(await service.options()); } catch (error) { next(error); }
    },
    publish: async (req, res, next) => {
      try { res.status(201).json(await service.publish(req.user.id, req.body)); } catch (error) { next(error); }
    },
  };
}
