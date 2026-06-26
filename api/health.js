export default {
  fetch() {
    return Response.json({
      ok: true,
      service: "eun-contents",
      timestamp: new Date().toISOString(),
    });
  },
};
