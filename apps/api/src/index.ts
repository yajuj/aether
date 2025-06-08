import express from 'express';
import dotenv from 'dotenv';
import router from './routes';

// Need to validate env variables with joi
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app
	.use(express.json())
	.use('/api', router)
	.listen(port, () => {
		console.log(`API server running on port ${port}`);
	});
