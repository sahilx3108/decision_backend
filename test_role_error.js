require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 'test' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

const payload = {
    messages: [
        { role: 'assistant', content: 'Hello! I am ready to discuss the strategy insight above or any of your decisions in more detail. What would you like to know?' },
        { role: 'user', content: 'test message' }
    ],
    context: {
        initialAdvice: 'Test advice',
        decisionsContext: 'Test decisions context'
    }
};

axios.post('http://localhost:5000/api/ai/chat', payload, {
    headers: { Authorization: `Bearer ${token}` }
})
    .then(res => console.log('SUCCESS:', res.data))
    .catch(err => {
        console.error('FAILED:', err.response ? err.response.data : err.message);
    });
