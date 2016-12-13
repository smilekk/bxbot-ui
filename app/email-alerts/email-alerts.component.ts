import {OnInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {NgForm} from '@angular/forms';
import {EmailAlertsConfig, EmailAlertsHttpDataPromiseService} from '../model/email-alerts';

/**
 * Email Alerts config component.
 */
@Component({
    moduleId: module.id,
    selector: 'bx-email-alerts',
    templateUrl: 'email-alerts.component.html',
    styleUrls: ['email-alerts.component.css']
})
export class EmailAlertsComponent implements OnInit {

    emailAlertsConfig: EmailAlertsConfig;
    exchangeId;
    active = true;

    @ViewChild('emailAlertsForm') currentForm: NgForm;
    emailAlertsForm: NgForm;

    constructor(private emailAlertsService: EmailAlertsHttpDataPromiseService, private route: ActivatedRoute,
                private router: Router) {
    }

    ngOnInit() {
        this.route.params.forEach((params: Params) => {
            this.exchangeId = params['id'];
            this.emailAlertsService.getEmailAlertsConfigForExchange(this.exchangeId)
                .then(emailAlertsConfig => this.emailAlertsConfig = emailAlertsConfig);
        });
    }

    save(isValid: boolean): void {
        if (isValid) {
            this.emailAlertsService.update(this.emailAlertsConfig)
                .then(() => this.goToDashboard());
        }
    }

    goToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
