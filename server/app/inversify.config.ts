import { DatabaseController } from '@app/controllers/database.controller';
import { DatabaseService } from '@app/services/database.service';
import { Container } from 'inversify';
import { Application } from './app';
import { EmailController } from './controllers/email.controller';
import { Server } from './server';
import { EmailService } from './services/email.service';
import { TYPES } from './types';

export const containerBootstrapper: () => Promise<Container> = async () => {
    const container: Container = new Container();

    container.bind(TYPES.Server).to(Server);
    container.bind(TYPES.Application).to(Application);

    container.bind(TYPES.DatabaseController).to(DatabaseController);
    container.bind(TYPES.DatabaseService).to(DatabaseService);
    container.bind(TYPES.EmailController).to(EmailController);
    container.bind(TYPES.EmailService).to(EmailService);
    return container;
};
const myContainer = new Container();

export { myContainer };
