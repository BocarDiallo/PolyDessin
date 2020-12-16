import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

// tslint:disable: no-any
describe('AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [AppComponent],
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should call prevent default', () => {
        const programmaticTrigger = (eventType: string, eventObject: any): void => {
            const mouseEvent = new MouseEvent(eventType, eventObject);
            const preventDefaultSpy = spyOn(mouseEvent, 'preventDefault');
            document.dispatchEvent(mouseEvent);
            expect(preventDefaultSpy).toHaveBeenCalled();
        };
        programmaticTrigger('contextmenu', { pageX: 250, pageY: 320 });
    });
});
