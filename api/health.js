export default {
  fetch() {
    return Response.json({
      ok: true,
      service: "relationship-analyzer-api",
      timestamp: new Date().toISOString(),
    });
  },
};