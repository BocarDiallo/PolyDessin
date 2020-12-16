import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EmailBody } from '@app/ressources/global-variables/email-body';
import { EmailService } from './email.service';

// tslint:disable:no-unused-variable
// tslint:disable:no-empty

describe('Service: EmailService', () => {
    let httpMock: HttpTestingController;
    let service: EmailService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [EmailService],
        });
        service = TestBed.inject(EmailService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should send post request correctly', () => {
        const url = 'test';
        const meta: EmailBody = { DESTINATION: 'this.emailAddress', PAYLOAD: 'base64', FILENAME: 'this.name', FORMAT: 'this.urlExtension' };
        service.sendMail(url, meta).subscribe(() => {}, fail);
        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('POST');
        req.flush(meta);
    });
});
