import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';
import { EmailService } from '../services/email.service';
import { TYPES } from '../types';

@injectable()
export class EmailController {
    router: Router;

    constructor(@inject(TYPES.EmailService) private emailService: EmailService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        this.router.post('/', async (req: Request, res: Response, next: NextFunction) => {
            this.emailService
                .sendByEmail(req.body)
                .then((data: string) => {
                    res.json(data);
                })
                .catch((error) => {
                    res.send(error);
                });
        });
    }
}
