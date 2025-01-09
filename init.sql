CREATE TYPE role_type AS ENUM ('tecnico', 'gerente');

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    password VARCHAR(100) NOT NULL,
    role role_type DEFAULT 'tecnico' NOT NULL
);

CREATE TABLE tasks (
    task_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(2500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    assigned_to INTEGER NOT NULL,
    CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);