# CustomAzureOpenAITraining
A script and code to train you a custom Open AI model in Azure

To create a custom model in Azure OpenAI using Node.js, you'll need to use the Azure OpenAI API and follow a process called fine-tuning. Fine-tuning allows you to customize a pre-existing model with your own data to improve its performance on specific tasks. Here's a step-by-step guide to create a custom model:

1. Set up your environment:
   First, make sure you have Node.js installed and create a new project. Then, install the required packages:

   ```bash
   npm init -y
   npm install @azure/openai dotenv
   ```

2. Set up your Azure OpenAI credentials:
   Create a `.env` file in your project root and add your Azure OpenAI credentials:

   ```
   AZURE_OPENAI_API_KEY=your_api_key
   AZURE_OPENAI_ENDPOINT=your_endpoint
   ```

3. Prepare your training data:
   Create a JSON file (e.g., `training_data.jsonl`) with your custom training data in the required format. Each line should be a separate JSON object with "prompt" and "completion" fields:

   ```json
   {"prompt": "Question: What is the capital of France?", "completion": "Answer: The capital of France is Paris."}
   {"prompt": "Question: Who wrote 'Romeo and Juliet'?", "completion": "Answer: William Shakespeare wrote 'Romeo and Juliet'."}
   ```

4. Create a script to upload the training file and create a fine-tuned model:

   ```javascript
   require('dotenv').config();
   const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
   const fs = require('fs');

   const client = new OpenAIClient(
     process.env.AZURE_OPENAI_ENDPOINT,
     new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
   );

   async function createCustomModel() {
     try {
       // Upload the training file
       const file = await client.files.create({
         file: fs.createReadStream('training_data.jsonl'),
         purpose: 'fine-tune'
       });

       console.log('File uploaded successfully. File ID:', file.id);

       // Create a fine-tuning job
       const fineTune = await client.fineTunes.create({
         training_file: file.id,
         model: 'curie', // Or another base model of your choice
         n_epochs: 4,
         batch_size: 1,
         learning_rate_multiplier: 0.1,
       });

       console.log('Fine-tuning job created. Job ID:', fineTune.id);

       // Wait for the fine-tuning job to complete
       let status = await client.fineTunes.retrieve(fineTune.id);
       while (status.status !== 'succeeded' && status.status !== 'failed') {
         await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
         status = await client.fineTunes.retrieve(fineTune.id);
         console.log('Fine-tuning status:', status.status);
       }

       if (status.status === 'succeeded') {
         console.log('Custom model created successfully. Model ID:', status.fine_tuned_model);
       } else {
         console.error('Fine-tuning failed:', status.error);
       }
     } catch (error) {
       console.error('Error:', error);
     }
   }

   createCustomModel();
   ```

5. Run the script:
   
   ```bash
   node create_custom_model.js
   ```

This script does the following:
- Uploads your training data file to Azure OpenAI.
- Creates a fine-tuning job using the uploaded file.
- Monitors the fine-tuning job until it completes or fails.
- Outputs the ID of the new custom model if successful.

After the custom model is created, you can use it in your applications by specifying its ID when making API calls.

Remember that fine-tuning is an advanced feature and may not be available on all Azure OpenAI deployments. Also, the exact parameters and base models available for fine-tuning may vary depending on your Azure OpenAI configuration and the latest API capabilities.

Always refer to the most recent Azure OpenAI documentation for the most up-to-date information on creating custom models and fine-tuning.
