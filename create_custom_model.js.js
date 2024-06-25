require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const API_KEY = process.env.AZURE_OPENAI_API_KEY;
const ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const API_VERSION = '2023-05-15'; // Update this to the latest version if needed

async function createCustomModel() {
  try {
    // Read the training data file
    const trainingData = fs.readFileSync('training_data.jsonl', 'utf8');

    // Create a fine-tuning job
    const response = await axios.post(
      `${ENDPOINT}/openai/fine-tunes?api-version=${API_VERSION}`,
      {
        model: 'curie', // Or another base model of your choice
        training_file: trainingData,
        n_epochs: 4,
        batch_size: 1,
        learning_rate_multiplier: 0.1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': API_KEY,
        },
      }
    );

    console.log('Fine-tuning job created. Job ID:', response.data.id);

    // Function to check the status of the fine-tuning job
    async function checkStatus(jobId) {
      const statusResponse = await axios.get(
        `${ENDPOINT}/openai/fine-tunes/${jobId}?api-version=${API_VERSION}`,
        {
          headers: {
            'api-key': API_KEY,
          },
        }
      );
      return statusResponse.data;
    }

    // Poll for job status
    let status = await checkStatus(response.data.id);
    while (status.status !== 'succeeded' && status.status !== 'failed') {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      status = await checkStatus(response.data.id);
      console.log('Fine-tuning status:', status.status);
    }

    if (status.status === 'succeeded') {
      console.log('Custom model created successfully. Model ID:', status.fine_tuned_model);
    } else {
      console.error('Fine-tuning failed:', status.error);
    }
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

createCustomModel();
