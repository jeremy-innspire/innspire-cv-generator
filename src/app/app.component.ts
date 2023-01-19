import { Component } from '@angular/core';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { DocumentService } from './services/document.service';
import { debounceTime } from 'rxjs';
import * as docx from 'docx-preview';
import * as FileSaver from 'file-saver';
import * as JSZip from 'jszip';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  group = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    role: new FormControl(''),
    birthdate: new FormControl(''),
    city: new FormControl(''),
    phone: new FormControl(''),
    mail: new FormControl(''),
    motivation: new FormControl(''),
    emailManager: new FormControl(''),
    phoneManager: new FormControl(''),
    hobbyDescription: new FormControl(''),
    methods: new FormArray<any>([]),
    tools: new FormArray<any>([]),
    certificates: new FormArray<any>([]),
    languages: new FormArray<any>([]),
    experiences: new FormArray<any>([]),
    educations: new FormArray<any>([])
  });

  private blob: Blob | undefined;
  private debounce = debounceTime(500);

  constructor(private documentService: DocumentService) {
    this.documentService.documentObservable.subscribe((blob) => {
      this.blob = blob;
      this.preview();
    })

    this.documentService.generate(this.group.value);

    this.group.valueChanges.pipe(this.debounce).subscribe((val) => {
      this.documentService.generate(val);
    })
  }

  public generateDocument(): void {
    if (this.blob) {
      const zip = new JSZip();
      zip.file(`${this.group.value.firstname}-${this.group.value.lastname}-cv.docx`, this.blob);
      zip.file(`${this.group.value.firstname}-${this.group.value.lastname}-cv.json`, JSON.stringify(this.group.value));
      zip.generateAsync({ type: 'blob' }).then((content) => {
        FileSaver(content, `${this.group.value.firstname}-${this.group.value.lastname}-cv.zip`);
      });
    }
  }

  public addMethod(method?: any) {
    const methodGroup = new FormGroup({
      method: new FormControl(method || ''),
    })
    this.group.controls.methods.controls.push(methodGroup);

    methodGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.methods.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteMethod(index: number): void {
    this.group.controls.methods.controls.splice(index, 1);
    this.group.controls.methods.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public addTool(tool?: any) {
    const toolGroup = new FormGroup({
      tool: new FormControl(tool || ''),
    })
    this.group.controls.tools.controls.push(toolGroup);

    toolGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.tools.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteTool(index: number): void {
    this.group.controls.tools.controls.splice(index, 1);
    this.group.controls.tools.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public addCertificate(certificate?: any) {
    const certificateGroup = new FormGroup({
      certificate: new FormControl(certificate || ''),
    })
    this.group.controls.certificates.controls.push(certificateGroup);

    certificateGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.certificates.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteCertificate(index: number): void {
    this.group.controls.certificates.controls.splice(index, 1);
    this.group.controls.certificates.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public addLanguage(language?: any) {
    const languageGroup = new FormGroup({
      language: new FormControl(language || '')
    });
    this.group.controls.languages.controls.push(languageGroup);

    languageGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.languages.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteLanguage(index: number): void {
    this.group.controls.languages.controls.splice(index, 1);
    this.group.controls.languages.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public addExperience(experience?: any) {
    const experienceGroup = new FormGroup({
      experienceYear: new FormControl(experience?.experienceYear || ''),
      experienceRole: new FormControl(experience?.experienceRole || ''),
      experienceEmployer: new FormControl(experience?.experienceEmployer || ''),
      experienceDescription: new FormControl(experience?.experienceDescription || ''),
    });
    this.group.controls.experiences.controls.push(experienceGroup);

    experienceGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.experiences.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteExperience(index: number): void {
    this.group.controls.experiences.controls.splice(index, 1);
    this.group.controls.experiences.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public addEducation(education?: any) {
    const educationGroup = new FormGroup({
      educationPeriod: new FormControl(education?.educationPeriod || ''),
      education: new FormControl(education?.education || ''),
      educationInstitute: new FormControl(education?.educationInstitute || ''),
    })
    this.group.controls.educations.controls.push(educationGroup);

    educationGroup.valueChanges.pipe(this.debounce).subscribe(() => {
      this.group.controls.educations.updateValueAndValidity();
      this.documentService.generate(this.group.value);
    })
  }

  public deleteEducation(index: number): void {
    this.group.controls.educations.controls.splice(index, 1);
    this.group.controls.educations.updateValueAndValidity();
    this.documentService.generate(this.group.value);
  }

  public preview(): void {
    if (this.blob) {
      docx.renderAsync(this.blob, document.getElementById('container') as HTMLElement);
    }
  }

  public importCv(target: any) {
    const reader = new FileReader();
    const onReaderLoad = (event: any) => {
      const formValue = JSON.parse(event.target.result);

      formValue.methods.forEach((method: any) => {
        this.addMethod(method);
      })

      formValue.tools.forEach((tool: any) => {
        this.addTool(tool);
      })

      formValue.certificates.forEach((certificate: any) => {
        this.addCertificate(certificate);
      })

      formValue.languages.forEach((language: any) => {
        this.addLanguage(language);
      })

      formValue.experiences.forEach((experience: any) => {
        this.addExperience(experience);
      })

      formValue.educations.forEach((education: any) => {
        this.addEducation(education);
      })

      this.group.patchValue(formValue);
    }

    reader.onload = onReaderLoad;
    reader.readAsText(target.files[0]);
  }

  public importTemplate(target: any) {
    const reader = new FileReader();
    const onReaderLoad = (event: any) => {
      this.documentService.updateTemplate(event.target.result, this.group.value);
    };

    reader.onload = onReaderLoad;
    reader.readAsArrayBuffer(target.files[0]);
  }
}
