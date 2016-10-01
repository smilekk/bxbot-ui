import {OnInit, Component} from "@angular/core";
import {ActivatedRoute, Params} from "@angular/router";
import {FormGroup, FormBuilder, Validators, FormControl, FormArray} from "@angular/forms";
import {Exchange, ErrorCode, ErrorMessage, ExchangeRestClientService} from "../shared/index";

/**
 * Reactive version of the Exchange Details form so I can decide which I like best.
 */
@Component({
    selector: 'bx-exchange-detail-rx',
    templateUrl: 'app/exchange/exchange-detail-rx.component.html',
    styleUrls: ['app/exchange/exchange-detail.component.css']
})
export class ExchangeDetailRxComponent implements OnInit {

    exchange: Exchange;
    selectedErrorCode: ErrorCode;
    selectedErrorMessage: ErrorMessage;
    active = true;
    saveClicked = false;

    public exchangeDetailsForm: FormGroup;

    constructor(private exchangeRestClientService: ExchangeRestClientService, private route: ActivatedRoute,
                private fb: FormBuilder) {
    }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            this.exchangeRestClientService.getExchange(id)
                .then(exchange => {
                    this.exchange = exchange;
                    this.buildForm();
                });
        });

        this.saveClicked = false;
    }

    goBack(): void {
        window.history.back();
    }

    save(): void {

        this.saveClicked = true;

        // update form model before save
        // TODO Must be better way to adapt/map domain model <-> form model?
        this.exchange.id = this.exchangeDetailsForm.get('exchangeId').value;
        this.exchange.adapter = this.exchangeDetailsForm.get('adapter').value;
        this.exchange.networkConfig.connectionTimeout = this.exchangeDetailsForm.get('connectionTimeout').value;

        // hack for now til I sort the JSON integration spec out with Boot app
        this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.length = 0;
        this.exchangeDetailsForm.get('nonFatalErrorHttpStatusCodes').value.forEach(
            (c) => this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.push({"value": parseInt(c)}));

        // hack for now til I sort the JSON integration spec out with Boot app
        this.exchange.networkConfig.nonFatalErrorMessages.length = 0;
        this.exchangeDetailsForm.get('nonFatalErrorMessages').value.forEach(
            (m) => this.exchange.networkConfig.nonFatalErrorMessages.push({"value": m}));

        this.exchangeRestClientService.update(this.exchange)
            .then(this.goBack);
    }

    onSelectErrorCode(selectedErrorCode: ErrorCode): void {
        this.selectedErrorCode = selectedErrorCode;
    }

    deleteErrorCode(i: number): void {

        const control = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorHttpStatusCodes'];
        control.removeAt(i);

        // this.exchange.networkConfig.nonFatalErrorHttpStatusCodes =
        //     this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.filter(c => c !== code);

        // if (this.selectedErrorCode === code) {
        //     this.selectedErrorCode = null;
        // }
    }

    addErrorCode(): void {

        const control = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorHttpStatusCodes'];
        // control.push(this.initErrorCode());
        control.push(this.createNewErrorCodeGroup());

        // this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.push(new ErrorCode(code));
        // this.selectedErrorCode = null;

        // TODO check this works - form reset hack until Google add this feature
        // this.active = false;
        // setTimeout(() => this.active = true, 0);
    }

    onSelectErrorMessage(selectedErrorMessage: ErrorMessage): void {
        this.selectedErrorMessage = selectedErrorMessage;
    }

    deleteErrorMessage(i: number): void {
        // this.exchange.networkConfig.nonFatalErrorMessages =
        //     this.exchange.networkConfig.nonFatalErrorMessages.filter(m => m !== message);

        const control = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorMessages'];
        control.removeAt(i);


        // TODO null off selected message
        // if (this.selectedErrorMessage === message) {
        //     this.selectedErrorMessage = null;
        // }
    }

    addErrorMessage(): void {

        const control = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorMessages'];
        control.push(this.createNewErrorMessageGroup());

        // this.exchange.networkConfig.nonFatalErrorMessages.push(new ErrorMessage(message));
        // this.selectedErrorMessage = null;

        // TODO check this works - form reset hack until Google add this feature
        // this.active = false;
        // setTimeout(() => this.active = true, 0);
    }

    // ------------------------------------------------------------------
    // Form validation
    // ------------------------------------------------------------------

    buildForm(): void {

        this.exchangeDetailsForm = this.fb.group({
            exchangeId: new FormControl({value: this.exchange.id, disabled: true}, Validators.required),
            adapter: [this.exchange.adapter, [
                Validators.required,
                Validators.minLength(1),
                Validators.maxLength(120)
            ]],
            connectionTimeout: [this.exchange.networkConfig.connectionTimeout, [
                Validators.required,
                Validators.pattern('\\d+')
            ]],
            nonFatalErrorHttpStatusCodes: new FormArray([]),
            nonFatalErrorMessages: new FormArray([]),
        });

        // TODO Must be better way to automatically init the arrays from the model??
        this.exchange.networkConfig.nonFatalErrorHttpStatusCodes.forEach(
            (code) => this.nonFatalErrorHttpStatusCodes.push(this.createErrorCodeGroup(code))
        );

        // TODO Must be better way to automatically init the arrays from the model??
        this.exchange.networkConfig.nonFatalErrorMessages.forEach(
            (msg) => this.nonFatalErrorMessages.push(this.createErrorMessageGroup(msg))
        );

        this.exchangeDetailsForm.valueChanges.subscribe(data => this.onValueChanged(data));
        this.onValueChanged(); // (re)set validation messages now
    }

    createErrorMessageGroup(errorMsg: ErrorMessage) {
        console.log("** errorMessage", errorMsg);
        return new FormControl(errorMsg.value, [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(120),
        ])
    }

    createNewErrorMessageGroup() {
        return new FormControl('', [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(120),
        ])
    }

    createErrorCodeGroup(code: ErrorCode) {
        console.log("** errorCode", code);
        return new FormControl(code.value, [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(3),
            Validators.pattern('\\d+'),
        ])
    }

    createNewErrorCodeGroup() {
        return new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(3),
            Validators.pattern('\\d+'),
        ])
    }

    get nonFatalErrorHttpStatusCodes(): FormArray {
        return this.exchangeDetailsForm.get('nonFatalErrorHttpStatusCodes') as FormArray;
    }

    get nonFatalErrorMessages(): FormArray {
        return this.exchangeDetailsForm.get('nonFatalErrorMessages') as FormArray;
    }

    initErrorCode() {
        return this.fb.group({
            value: ['',
                Validators.required,
                Validators.pattern('\\d+')
            ],
        });
    }

    // initErrorCode() {
    //     return this.fb.group({
    //         value: [this.exchange.networkConfig.nonFatalErrorHttpStatusCodes]
    //     });
    // }

    onValueChanged(data?: any) {

        if (!this.exchangeDetailsForm) {
            return;
        }

        const form = this.exchangeDetailsForm;

        for (const field in this.formErrors) {
            // clear previous error message (if any)
            this.formErrors[field] = '';
            const control = form.get(field);

            if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    this.formErrors[field] += messages[key] + ' ';
                }
            }
        }

        // TODO hack to go though 'unknown' fields in error codes - must be better way?
        const errorCodeControl = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorHttpStatusCodes'];
        if (errorCodeControl && errorCodeControl.dirty && !errorCodeControl.valid) {
            const messages = this.validationMessages['nonFatalErrorHttpStatusCodes'];
            this.formErrors['nonFatalErrorHttpStatusCodes'] += messages['required'] + ' ';
        }

        // TODO hack to go though 'unknown' fields in error messages - must be better way?
        const errorMessageControl = <FormArray>this.exchangeDetailsForm.controls['nonFatalErrorMessages'];
        if (errorMessageControl && errorMessageControl.dirty && !errorMessageControl.valid) {
            const messages = this.validationMessages['nonFatalErrorMessages'];
            this.formErrors['nonFatalErrorMessages'] += messages['required'] + ' ';
        }
    }

    formErrors = {
        'adapter': '',
        'connectionTimeout': '',
        'nonFatalErrorHttpStatusCodes': '',
        'nonFatalErrorMessages': ''
    };

    validationMessages = {
        'adapter': {
            'required': 'Adapter name is required.',
            'maxlength': 'Adapter name cannot be more than 120 characters long.'
        },
        'connectionTimeout': {
            'required': 'Connection timeout is required.',
            'pattern': 'Connection timeout must be a whole number.'
        },
        'nonFatalErrorHttpStatusCodes': {
            'required': 'Code must be a number.'
        },
        'nonFatalErrorMessages': {
            'required': 'Message must not be empty.'
        }
    };
}


