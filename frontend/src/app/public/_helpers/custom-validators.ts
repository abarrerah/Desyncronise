import { AbstractControl, ValidationErrors } from "@angular/forms";

export class CustomValidators{

    static passwordsMatching(control: AbstractControl): ValidationErrors |null {
        const password = control.get('password')?.value;
        const passwordConfirm = control.get('password')?.value;
        
        if((password === passwordConfirm) && (password !== null && passwordConfirm !== null)) {
            return null;
        } else {
            return { passswordsNotMatching: true };
        }
    }
}