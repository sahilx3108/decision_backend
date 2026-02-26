const jwt = require('jsonwebtoken');

// 1. Generate a valid token
const token = jwt.sign({ id: 'test_user_id' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

const payload = {
    messages: [{ role: 'user', content: 'test message' }],
    context: {
        initialAdvice: 'Test advice',
        decisionsContext: 'Test decisions context'
    }
};

fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
})
    .then(res => res.json().then(data => ({ status: res.status, data })))
    .then(({ status, data }) => {
        if (status >= 400) {
            console.error('FAILED:', status, data);
        } else {
            console.log('SUCCESS:', data);
        }
    })
    .catch(err => console.error('Fetch error:', err));
