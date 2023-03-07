import { Component } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { DocumentService } from './services/document.service';
import { debounceTime } from 'rxjs';
import { ICertificate, IEducation, IExperience, ILanguage, IMethod, ITemplateObject, ITool, TPossibleFormArrayName, TPossibleFormValue } from './interfaces/template-object';
import * as docx from 'docx-preview';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public group = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    role: new FormControl(''),
    birthdate: new FormControl(''),
    city: new FormControl(''),
    phone: new FormControl(''),
    mail: new FormControl(''),
    linkedin: new FormControl(''),
    motivation: new FormControl(''),
    emailManager: new FormControl(''),
    phoneManager: new FormControl(''),
    hobbyDescription: new FormControl(''),
    methods: new FormArray([]),
    tools: new FormArray([]),
    certificates: new FormArray([]),
    languages: new FormArray([]),
    experiences: new FormArray([]),
    educations: new FormArray([])
  });

  private blob: Blob | undefined;
  private debounce = debounceTime(500);

  constructor(private documentService: DocumentService) {
    this.documentService.documentObservable.subscribe((blob) => {
      this.blob = blob;
      this.renderPreview();
    })

    this.documentService.generate(this.group.value as ITemplateObject);

    this.group.valueChanges.pipe(this.debounce).subscribe((val) => {
      this.documentService.generate(val as ITemplateObject);
    })
  }

  public downloadDocument(): void {
    if (this.blob) {
      const filename = `${this.group.value.firstname}-${this.group.value.lastname}-cv`;

      const zip = new JSZip();
      zip.file(`${filename}-unedited.docx`, this.blob);
      zip.file(`${filename}-cv.json`, JSON.stringify(this.group.value));
      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver(content, `${filename}-cv.zip`);
      });
    }
  }

  public addToFormArray(formArrayName: TPossibleFormArrayName, value?: TPossibleFormValue): void {
    const groupForFormArray = this.createGroupForFormArray(formArrayName, value);
    const formArray = (this.group.get(formArrayName) as FormArray);

    formArray.push(groupForFormArray);

    groupForFormArray.valueChanges.pipe(this.debounce).subscribe(() => {
      formArray.updateValueAndValidity();
      this.documentService.generate(this.group.value as ITemplateObject);
    })
  }

  public deleteGroupFromFormArray(formArrayName: TPossibleFormArrayName, index: number): void {
    const formArray = (this.group.get(formArrayName) as FormArray);
    formArray.controls.splice(index, 1);
    formArray.updateValueAndValidity();
    this.documentService.generate(this.group.value as ITemplateObject);
  }

  public importCv(target: any) {
    const reader = new FileReader();
    const onReaderLoad = (event: any) => {
      const formValue = JSON.parse(event.target.result);
      const formArrayNames: TPossibleFormArrayName[] = ['methods', 'tools', 'certificates', 'languages', 'experiences', 'educations'];

      formArrayNames.forEach(formArrayName => {
        formValue[formArrayName].forEach((value: TPossibleFormValue) => {

          this.addToFormArray(formArrayName, value);
        });
      });

      this.group.patchValue(formValue);
      console.log(this.group.value)
    }

    reader.onload = onReaderLoad;
    reader.readAsText(target.files[0]);

  }

  public importTemplate(target: any) {
    const reader = new FileReader();
    const onReaderLoad = (event: any) => {
      this.documentService.updateTemplate(event.target.result, this.group.value as ITemplateObject);
    };

    reader.onload = onReaderLoad;
    reader.readAsArrayBuffer(target.files[0]);
  }

  private createGroupForFormArray(formArrayName: string, value?: TPossibleFormValue): FormGroup {
    switch(formArrayName) {
      case 'methods':
        return new FormGroup({
          method: new FormControl((value as IMethod)?.method || ''),
        });
      case 'tools':
        return new FormGroup({
          tool: new FormControl((value as ITool)?.tool || ''),
        });
      case 'certificates':
        return new FormGroup({
          certificate: new FormControl((value as ICertificate)?.certificate || ''),
        });
      case 'languages':
        return new FormGroup({
          language: new FormControl((value as ILanguage)?.language)
        });
      case 'experiences':
        const experience = value as IExperience;
        return new FormGroup({
          experienceYear: new FormControl(experience?.experienceYear || ''),
          experienceRole: new FormControl(experience?.experienceRole || ''),
          experienceEmployer: new FormControl(experience?.experienceEmployer || ''),
          experienceDescription: new FormControl(experience?.experienceDescription || ''),
          experienceMethods: new FormControl(experience?.experienceMethods || '')
        });
      case 'educations':
        const education = value as IEducation;
        return new FormGroup({
          educationPeriod: new FormControl(education?.educationPeriod || ''),
          education: new FormControl(education?.education || ''),
          educationInstitute: new FormControl(education?.educationInstitute || ''),
        })
      default:
        throw new Error(`Unknown formArray name used: "${formArrayName}"`)
    }
  }

  private renderPreview(): void {
    if (this.blob) {
      docx.renderAsync(this.blob, document.getElementById('container') as HTMLElement);
    }
  }
}
