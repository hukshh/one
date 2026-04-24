import app from './app';
const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MeetingMind API running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Local access: http://localhost:${PORT}`);
  });

  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please kill the process using it and try again.`);
    } else {
      console.error('❌ Server error:', error);
    }
    process.exit(1);
  });
};

startServer();

