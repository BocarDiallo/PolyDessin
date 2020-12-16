import axios from 'axios';
import * as FormData from 'form-data';
import { injectable } from 'inversify';
import 'reflect-metadata';
import { EmailData } from '../ressources/email-data';

@injectable()
export class EmailService {
    async sendByEmail(data: EmailData): Promise<void | string> {
        if (data.RECIPIENT !== ' ') {
            const MAIL_API_208_TEAM_KEY = process.env.MAIL_KEY;
            const MAIL_API_URL = 'http://log2990.step.polymtl.ca/email?address_validation=true&quick_return=true';

            const formData: FormData = new FormData();
            const buffer = Buffer.from(data.PAYLOAD, 'base64');
            formData.append('to', data.RECIPIENT);
            formData.append('payload', buffer, {
                contentType: data.FORMAT,
                filename: data.FILENAME + '.' + data.FORMAT.split('/')[1],
            });
            const formHeaders = formData.getHeaders();
            const config = {
                headers: {
                    'x-team-key': MAIL_API_208_TEAM_KEY,
                    'content-type': 'multipart/form-data',
                    ...formHeaders,
                },
            };
            return axios
                .post(MAIL_API_URL, formData, config)
                .then((res) => res.status.toString())
                .catch((error: Error) => {
                    throw error;
                });
        }

        return 'No email recipient';
    }
}
