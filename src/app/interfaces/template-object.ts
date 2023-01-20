export interface ITemplateObject {
  firstname: string;
  lastname: string;
  role: string;
  birthdate: string;
  city: string;
  phone: string;
  mail: string;
  motivation: string;
  emailManager: string;
  phoneManager: string;
  hobbyDescription: string;
  methods: IMethod[];
  tools: ITool[];
  certificates: ICertificate[];
  languages: ILanguage[];
  experiences: IExperience[];
  educations: IEducation[];
}

export interface IMethod {
  method: string;
}

export interface ITool {
  tool: string;
}

export interface ICertificate {
  certificate: string;
}

export interface ILanguage {
  language: string;
}

export interface IExperience {
  experienceYear: string;
  experienceRole: string;
  experienceEmployer: string;
  experienceDescription: string;
}

export interface IEducation {
  educationPeriod: string;
  education: string;
  educationInstitute: string;
}

export type TPossibleFormArrayName = keyof Pick<ITemplateObject, 'methods' | 'tools' | 'certificates' | 'languages' | 'experiences' | 'educations'>;

export type TPossibleFormValue = 'string' | IMethod | ITool | ICertificate | ILanguage | IExperience | IEducation;
