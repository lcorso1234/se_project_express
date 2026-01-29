
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-later';

const { JWT_SECRET = 'super-strong-secret' } = process.env;

module.exports = { JWT_SECRET };
/Users/lawrencecorso/Downloads/env