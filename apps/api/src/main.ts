import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  const port = Number(process.env.PORT ?? 3000);
  const host = '0.0.0.0';
  await app.listen({ port, host });
  console.log(`PowerMech AI API listening on http://${host}:${port}`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('Fatal error during bootstrap:', message);
  process.exit(1);
});
