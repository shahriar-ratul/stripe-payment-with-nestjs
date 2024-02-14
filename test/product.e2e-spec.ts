import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/products (GET)', async () => {
        return request(app.getHttpServer())
            .get('/products')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.body).toBeDefined();
                expect(response.body.data).toBeDefined();

            });
    });

    it('/products (POST)', async () => {
        return request(app.getHttpServer())
            .post('/products')
            .send({
                name: 'Product 1',
                price: 100,
                stock: 10,
                description: 'Product 1 description'
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toBeDefined();
            });
    });

});
