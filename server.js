import app from './api/index.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Local development backend server running on http://localhost:${PORT}`);
});
