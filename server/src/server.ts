import app from './app';
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 MeetingMind API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
