import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('/orders (GET)', async () => {
        return request(app.getHttpServer())
            .get('/orders')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                expect(response.body).toBeDefined();
                expect(response.body.data).toBeDefined();
            });
    });


    it('/orders (POST)', async () => {
        return request(app.getHttpServer())
            .post('/orders')
            .send({
                items: [
                    {
                        productId: 1,
                        quantity: 100
                    }
                ],
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toBeDefined();
                expect(response.body.paymentUrl).toBeDefined();

            });
    });
});
