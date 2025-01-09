import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js'; // Verifique se o caminho para o arquivo do app está correto
import pool from '../src/db/db.js';

describe('Integrations Tests', () => {
  let tecnico, gerente, tecToken, gerToken, gerTask, tecTask;
  describe('test Users', () => {
    it('create tecnico', async () => {
      const obj = {
        name: 'Tecnico de teste',
        email: 'tecnicodeteste@email.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      };
      const res = await request(app).post('/api/v1/auth/register').send(obj);

      expect(res.status).to.equal(201);

      const user = res.body.data.user;

      expect(user.name).to.equal(obj.name);

      expect(user.email).to.equal(obj.email);

      expect(user.role).to.equal('tecnico');

      expect(user.user_id).to.exist;
    });

    it('create gerente', async () => {
      const obj = {
        name: 'Gerente de teste',
        email: 'gerentedeteste@email.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
        role: 'gerente',
      };
      const res = await request(app).post('/api/v1/auth/register').send(obj);

      expect(res.status).to.equal(201);

      const user = res.body.data.user;

      expect(user.name).to.equal(obj.name);

      expect(user.email).to.equal(obj.email);

      expect(user.role).to.equal(obj.role);

      expect(user.user_id).to.exist;

      gerente = user;
      gerToken = res.body.token;
    });

    it('test login', async () => {
      const obj = {
        name: 'Tecnico de teste',
        email: 'tecnicodeteste@email.com',
        password: 'test1234',
        passwordConfirm: 'test1234',
      };
      const res = await request(app).post('/api/v1/auth/login').send(obj);

      expect(res.status).to.equal(200);

      const user = res.body.data.user;

      expect(user.name).to.equal(obj.name);

      expect(user.email).to.equal(obj.email);

      expect(user.role).to.equal('tecnico');

      expect(user.user_id).to.exist;
      expect(res.body.token).to.exist;

      tecnico = user;
      tecToken = res.body.token;
    });
  });

  describe('TASK CRUD', () => {
    after(async () => {
      try {
        console.log('RODANDO AFTER');

        await pool.query('DELETE FROM users WHERE user_id IN ($1, $2)', [
          tecnico.user_id,
          gerente.user_id,
        ]);

        await pool.query('DELETE FROM tasks WHERE task_id IN ($1, $2)', [
          tecTask.task_id,
          gerTask.task_id,
        ]);
      } catch (err) {
        console.log('erro ao apager usarios e tarefas', err);
      }
    });
    it('a tecnico should be able to create a task', async () => {
      const obj = {
        title: 'test task',
        description: 'description of test task',
      };
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${tecToken}`)
        .send(obj);

      expect(res.status).to.equal(201);

      expect(res.body.data.title).to.equal(obj.title);

      expect(res.body.data.description).to.equal(obj.description);

      expect(res.body.data.assigned_to).to.equal(tecnico.user_id);

      expect(res.body.data.task_id).to.exist;

      tecTask = res.body.data;
    });

    it('a manager should be able to create a task', async () => {
      const obj = {
        title: 'test task G',
        description: 'description of test task G',
        assignedTo: tecnico.user_id,
      };
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${gerToken}`)
        .send(obj);

      expect(res.status).to.equal(201);

      expect(res.body.data.title).to.equal(obj.title);

      expect(res.body.data.description).to.equal(obj.description);

      expect(res.body.data.assigned_to).to.equal(tecnico.user_id);

      expect(res.body.data.task_id).to.exist;

      gerTask = res.body.data;
    });

    it('a manager should not be able to create a task if it is assigned to an user who is not a tecnico', async () => {
      const obj = {
        title: 'test task not a tecnico',
        description: 'description of test task G',
        assignedTo: gerente.user_id,
      };
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${gerToken}`)
        .send(obj);

      expect(res.status).to.equal(403);

      expect(res.body.data).to.not.exist;
    });

    it('should return an error when description lenght is above the 2500 char limit', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${tecToken}`)
        .send({
          title: 'test task',
          description: 'description of test task'.repeat(106),
        });

      expect(res.status).to.equal(400);

      expect(res.body.data).to.not.exist;
    });

    it('should return a error when any value is null', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${tecToken}`)
        .send({
          title: null,
          description: null,
        });

      expect(res.status).to.equal(400);

      expect(res.body.data).to.not.exist;
    });

    it('a tecnico should be able to update a task', async () => {
      const obj = {
        title: 'titulo de teste atualizado',
        description: 'descriçao de teste atualizada',
      };
      const res = await request(app)
        .patch(`/api/v1/tasks/${tecTask.task_id}`)
        .set('Authorization', `Bearer ${tecToken}`)
        .send(obj);

      expect(res.status).to.equal(200);

      expect(res.body.data.title).to.equal(obj.title);

      expect(res.body.data.description).to.equal(obj.description);
    });

    it('a manager should be able to update a task', async () => {
      const obj = {
        title: 'titulo de teste atualizado G',
        description: 'descriçao de teste atualizada G',
      };
      const res = await request(app)
        .patch(`/api/v1/tasks/${gerTask.task_id}`)
        .set('Authorization', `Bearer ${gerToken}`)
        .send(obj);

      expect(res.status).to.equal(200);

      expect(res.body.data.title).to.equal(obj.title);

      expect(res.body.data.description).to.equal(obj.description);
    });

    it('a tecnico should be able to complete a task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/complete-task/${tecTask.task_id}`)
        .set('Authorization', `Bearer ${tecToken}`);

      expect(res.status).to.equal(200);

      expect(res.body.data.completed_at).to.not.equal(null);
    });

    //um gerente deve ser capaz de completar tarefas seja as que ele pessoalmente criou ou as criadas por tecnicos
    //neste caso ele esta completando a tarefa que ele criou e atribui ao tecnico de teste
    //internamente sera como se o o proprio tecnico a que a task foi atribuida a tivese completado
    it('a manager should be able to complete a task', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/complete-task/${gerTask.task_id}`)
        .set('Authorization', `Bearer ${gerToken}`)
        .send({ assignedTo: tecnico.user_id });

      expect(res.status).to.equal(200);

      expect(res.body.data.completed_at).to.not.equal(null);
    });

    it('should return an error when trying to complete a task that is alredy completed', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/complete-task/${tecTask.task_id}`)
        .set('Authorization', `Bearer ${tecToken}`);

      expect(res.status).to.equal(403);

      expect(res.body.data).to.not.exist;
    });

    it('a tecnico should be able to delete a task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${tecTask.task_id}`)
        .set('Authorization', `Bearer ${tecToken}`);

      expect(res.status).to.equal(204);

      expect(res.body.data).to.not.exist;
    });

    it('a manager should be able to delete a task', async () => {
      const res = await request(app)
        .delete(`/api/v1/tasks/${gerTask.task_id}`)
        .set('Authorization', `Bearer ${gerToken}`);

      expect(res.status).to.equal(204);

      expect(res.body.data).to.not.exist;
    });
  });
});
