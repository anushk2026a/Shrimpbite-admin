const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('https://api.shrimpbite.in/api/retailer/login', {
            email: 'bob@gmail.com', // wait, I will just send a direct request without auth if it allows? No.
        });
    } catch(e) {}
}
