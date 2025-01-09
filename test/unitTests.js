import { expect } from 'chai';
import * as taskController from '../src/controller/taskController.js';
import * as authController from '../src/controller/authController.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Task from '../src/models/taskModel.js';
import pool from '../src/db/db.js';
import User from '../src/models/userModel.js';
import sinon from 'sinon';

const wait = (sec) =>
  new Promise((resolve) => {
    setTimeout(resolve, 1000 * sec);
  });

describe('unit test', function () {
  describe('testing Task model methods', () => {
    afterEach(() => {
      sinon.restore(); // Restaura métodos originais após cada teste
    });
    it('Task.findAll: should return all tasks if manager', async () => {
      const isTecnicoId = false;
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['all tasks'] }));
      const result = await Task.findAll(isTecnicoId);
      expect(result[0]).to.be.equal('all tasks');
    });

    it('Task.findAll: should return all tasks assigned to tecnico', async () => {
      const isTecnicoId = 12;
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['all tasks'] }));
      const result = await Task.findAll(isTecnicoId);
      expect(result[0]).to.be.equal('all tasks');
    });

    it('Task.findById: should return any specific task if manager', async () => {
      const isTecnicoId = false;
      const taskId = 56;
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['specific task'] }));
      const result = await Task.findById(taskId, isTecnicoId);
      expect(result).to.be.equal('specific task');
    });

    it('Task.findById: should return a specific task assigned to tecnico', async () => {
      const isTecnicoId = 12;
      const taskId = 56;
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['specific task'] }));
      const result = await Task.findById(taskId, isTecnicoId);
      expect(result).to.be.equal('specific task');
    });

    it('Task.create: should return the created task', async () => {
      const assignedTo = 12;
      const values = ['title', 'description'];
      sinon.stub(pool, 'query').returns({ rows: [0] });
      const result = await Task.create(values, assignedTo);
      expect(result).to.be.equal(0);
    });

    it('Task.findByIdAndUpdate: should return the updated task if manager', async () => {
      const isTecnicoId = false;
      const taskId = 56;
      const values = ['updated title', 'updated description'];
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['updated task'] }));
      const result = await Task.findByIdAndUpdate(taskId, values, isTecnicoId);
      expect(result).to.be.equal('updated task');
    });

    it('Task.findByIdAndUpdate: should return the updated task if tecnico', async () => {
      const isTecnicoId = 12;
      const taskId = 56;
      const values = ['updated title', 'updated description'];
      sinon
        .stub(pool, 'query')
        .returns(Promise.resolve({ rows: ['updated task'] }));
      const result = await Task.findByIdAndUpdate(taskId, values, isTecnicoId);
      expect(result).to.be.equal('updated task');
    });

    it('Task.markTaskAsCompleted: should return completed task', async () => {
      const assignedTo = 12;
      const taskId = 56;

      sinon.stub(pool, 'connect').returns(
        Promise.resolve({
          query() {
            return {
              rows: [0],
            };
          },
          release() {},
        })
      );
      const result = await Task.markTaskAsCompleted(taskId, assignedTo);
      expect(result).to.be.equal(0);
    });

    it('Task.delete: should delete the task if tecnico', async () => {
      const isTecnicoId = 12;
      const taskId = 56;
      sinon.stub(pool, 'query').returns(Promise.resolve({ rowCount: 1 }));
      const result = await Task.delete(taskId, isTecnicoId);
      expect(result).to.be.equal(1);
    });

    it('Task.delete: should delete the task if manager', async () => {
      const isTecnicoId = false;
      const taskId = 56;
      sinon.stub(pool, 'query').returns(Promise.resolve({ rowCount: 1 }));
      const result = await Task.delete(taskId, isTecnicoId);
      expect(result).to.be.equal(1);
    });
  });
  describe('testing task controller functions', function () {
    afterEach(() => {
      sinon.restore(); // Restaura métodos originais após cada teste
    });
    it('taskController.getAllTasks: should get all tasks', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon.stub(Task, 'findAll').returns(Promise.resolve('all tasks'));

      await taskController.getAllTasks(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: 'all tasks' })).to
        .be.true;
    });

    it('taskController.getTask: should get a task specifed by the id', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
        },
        params: {
          taskId: 2,
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon.stub(Task, 'findById').returns(Promise.resolve('task'));

      await taskController.getTask(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: 'task' })).to.be
        .true;
    });

    it('taskController.createTask: should create a task', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
        },
        params: {
          taskId: 2,
        },
        body: {
          title: 'task title',
          description: 'task description',
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon.stub(Task, 'create').returns(Promise.resolve('created task'));

      await taskController.createTask(req, res);

      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: 'created task' }))
        .to.be.true;
    });

    it('taskController.completeTheTask: should complete a task', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
          name: 'jonas',
        },
        params: {
          taskId: 2,
        },
        body: {
          assignedTo: 1,
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon
        .stub(Task, 'markTaskAsCompleted')
        .returns(Promise.resolve('completed task'));

      sinon.stub(pool, 'query').returns(Promise.resolve({ rows: [] }));

      await taskController.completeTheTask(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: 'completed task' }))
        .to.be.true;
    });

    it('taskController.updateTask: should update a task', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
          name: 'jonas',
        },
        params: {
          taskId: 2,
        },
        body: {
          title: 'task title updated',
          description: 'task description updated',
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon
        .stub(Task, 'findByIdAndUpdate')
        .returns(Promise.resolve('updated task'));

      await taskController.updateTask(req, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: 'updated task' }))
        .to.be.true;
    });

    it('taskController.deleteTask: should delete a task', async () => {
      const req = {
        user: {
          user_id: 1,
          role: 'tecnico',
          name: 'jonas',
        },
        params: {
          taskId: 2,
        },
      };

      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };

      sinon.stub(Task, 'delete').returns(Promise.resolve(null));

      await taskController.deleteTask(req, res);

      expect(res.status.calledWith(204)).to.be.true;
      expect(res.json.calledWith({ status: 'success', data: null })).to.be.true;
    });
  });

  describe('testing authController functions', function () {
    afterEach(() => {
      sinon.restore();
    });

    let jwtToken;
    it('authController.singToken: should create a valid jwt', async () => {
      try {
        const token = authController.singToken(12);
        const decoded = await promisify(jwt.verify)(
          token,
          process.env.JWT_SECRET
        );
        expect(decoded.id).to.be.equal(12);
        jwtToken = token;
      } catch (err) {
        expect(err).to.not.exist;
      }
    });

    it('authController.createSendToken: should send a jwt', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        cookie: sinon.stub(),
      };

      authController.createSendToken({ user_id: 12 }, 200, res);

      expect(res.status.calledWith(200)).to.be.true;
      expect(res.cookie.calledWith('jwt')).to.be.true;
    });

    it('authController.register: should register a user', async () => {
      const res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
        cookie: sinon.stub(),
      };

      const req = {
        body: {
          name: 'jonas',
          email: 'jonas@email.com',
          password: 'test1234',
          passwordConfirm: 'test1234',
          role: 'tecnico',
        },
      };

      sinon.stub(User, 'create').returns({
        user_id: 12,
        name: 'jonas',
        email: 'jonas@email.com',
        password: 'test1234',
        role: 'tecnico',
      });

      await authController.register(req, res);

      expect(res.status.calledWith(201)).to.be.true;
    });

    it('authController.login: should login', async () => {
      const obj = {};
      const res = {
        status: (code) => {
          console.log('CODIGOCODIGOCODIGOCODIGOCODIGOCODIGOCODIGO', code);
          obj.code = code;
          return this;
        },
        json: sinon.stub(),
        cookie: sinon.stub(),
      };

      const req = {
        body: {
          name: 'jonas',
          email: 'jonas@email.com',
          password: 'test1234',
          passwordConfirm: 'test1234',
          role: 'tecnico',
        },
      };

      sinon.stub(User, 'correctPassword').returns(true);
      sinon.stub(pool, 'query').returns({
        rows: [
          {
            user_id: 12,
            name: 'jonas',
            email: 'jonas@email.com',
            password: 'test1234',
            role: 'tecnico',
          },
        ],
      });

      await authController.login(req, res);

      await wait(0.09);

      expect(obj.code).to.be.equal(200);
    });

    it('authController.protect: should allow authenticated users', async () => {
      const obj = {};
      const res = {
        locals: {},
      };

      const next = sinon.stub();

      const req = {
        cookies: {
          jwt: jwtToken,
        },
      };

      sinon.stub(pool, 'query').returns({
        rows: [
          {
            user_id: 12,
            name: 'jonas',
            email: 'jonas@email.com',
            password: 'test1234',
            role: 'tecnico',
          },
        ],
      });

      await authController.protect(req, res, next);
      await wait(0.09);
      expect(req.user).to.be.deep.equal({
        user_id: 12,
        name: 'jonas',
        email: 'jonas@email.com',
        password: 'test1234',
        role: 'tecnico',
      });
    });

    it('authController.protect: should not allow unauthenticated users', async () => {
      const obj = {};
      const res = {
        locals: {},
      };

      const next = (err) => {
        obj.err = err;
        console.log(err.message, err);
      };

      const req = {
        cookies: {},
        headers: {},
      };

      sinon.stub(pool, 'query').returns({
        rows: [
          {
            user_id: 12,
            name: 'jonas',
            email: 'jonas@email.com',
            password: 'test1234',
            role: 'tecnico',
          },
        ],
      });

      await authController.protect(req, res, next);

      expect(obj.err.message).to.be.equal('you are not logged in!');
      expect(obj.err.statusCode).to.be.equal(401);
    });
  });
});
