module.exports = {
  apiKey: process.env.APPLITOOLS_API_KEY,
  batchName: 'Multi Platform Demo',
  batchId: process.env.APPLITOOLS_BATCH_ID,
  browsers: [
    { width: 1200, height: 800, name: 'chrome' },
    { width: 768, height: 1024, name: 'chrome' }
  ]
};
