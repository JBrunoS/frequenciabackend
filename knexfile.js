// Update with your config settings.
 
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
 
  development: {
    client: 'mysql',
    connection: {
      host: 'mysql.associacaomaranataamanari.com.br',
      user: 'apifrequencia',
      password: 'Pev12345',
      database: 'apifrequencia'
 
    },
    migrations: {
      directory: './src/database/migrations'
    }
  },
 
  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user: 'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
 
  production: {
    client: 'mysql',
    connection: {
      host: 'mysql.associacaomaranataamanari.com.br',
      user: 'apifrequencia',
      password: 'Pev12345',
      database: 'apifrequencia'
 
    },
    ssl: {
      rejectUnauthorized: false
    },
    migrations: {
      directory: './src/database/migrations'
    }
  }
};
 