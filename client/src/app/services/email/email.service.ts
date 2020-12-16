import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmailBody } from '@app/ressources/global-variables/email-body';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class EmailService {
    constructor(private http: HttpClient) {}

    sendMail(url: string, body: EmailBody): Observable<void> {
        return this.http.post<void>(url, body);
    }
}
