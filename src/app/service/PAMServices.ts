import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie';
import { KieSettings } from '../Models/KieSettings/KieSettings';
import { Part, ServiceRequest, ProcessInstanceData, ComputerRequestWrapper } from '../Models/Requests/Request';
import { RootObject, Command, Insert } from '../Models/Requests/Request';
import { Credentials } from '../Models/UserRole';
import { Template, Step, Applicant, Loan, LoanWrapper, ApplicantWrapper, ProcessRequirementsWrapper } from '../Models/Requests/Request';

@Injectable({ providedIn: 'root' })
export class PAMServices {

  private kieSettings: KieSettings;
  private availableTemplates: Template[];
  private stageMap: Map<string, Step>;

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.kieSettings = <KieSettings>this.cookieService.getObject("kieSettingsCaseSalesKit")
    if (this.kieSettings === undefined) {
      this.kieSettings = {
        baseurl: "http://localhost:8080/kie-server",
        dmcontainerAlias: "casesaleskit-rules_1.0.0-SNAPSHOT",
        picontainerAlias: "casesaleskit-process_1.0.0-SNAPSHOT",
        processId: "casesaleskit-process.DynamicLoanProcess",
        username: "pamAdmin",
        password: "redhatpam1!",
        isOpenShift: false
      };
    }
    this.availableTemplates = new Array();
    this.stageMap = new Map();
    this.stageMap.set("Application Review", { name: "Application Review", stage: "stage1", step: 1, sla: 10, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Credit Check", { name: "Credit Check", stage: "stage2", step: 2, sla: 1, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Proof of Income", { name: "Proof of Income", stage: "stage3", step: 3, sla: 5, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Risk Evaluation", { name: "Risk Evaluation", stage: "stage4", step: 4, sla: 3, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Loan Final Approval", { name: "Loan Final Approval", stage: "stage5", step: 5, sla: 10, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Precoverage Letter", { name: "Precoverage Letter", stage: "stage6", step: 6, sla: 2, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Home Appraisal", { name: "Home Appraisal", stage: "stage7", step: 7, sla: 4, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.stageMap.set("Title Closing", { name: "Title Closing", stage: "stage8", step: 8, sla: 3, slaunit: "Days", isNew: false, count: 0, isTriggered: false });
    this.initTemplates();
  }


  private initTemplates() {
    var simplePersonalLoanTemplateSteps = [this.stageMap.get("Application Review"), this.stageMap.get("Credit Check"),
    this.stageMap.get("Risk Evaluation"), this.stageMap.get("Loan Final Approval")];
    var simplePersonalLoanTemplate: Template = {
      name: "Personal Loan",
      steps: simplePersonalLoanTemplateSteps,
      isOverrideWithRules: false
    }
    this.availableTemplates.push(simplePersonalLoanTemplate);

    var homeEquityTemplateSteps = [this.stageMap.get("Application Review"), this.stageMap.get("Home Appraisal"), this.stageMap.get("Risk Evaluation"), this.stageMap.get("Loan Final Approval")];
    var homeEquityTemplate: Template = {
      name: "Home Equity",
      steps: homeEquityTemplateSteps,
      isOverrideWithRules: false
    }
    this.availableTemplates.push(homeEquityTemplate);

    var mortgageLoanTemplateSteps = [this.stageMap.get("Application Review"), this.stageMap.get("Credit Check"),
    this.stageMap.get("Precoverage Letter"),
    this.stageMap.get("Home Appraisal"), this.stageMap.get("Title Closing"),
    this.stageMap.get("Loan Final Approval")];
    var mortgageLoanTemplate: Template = {
      name: "Mortgage Template",
      steps: mortgageLoanTemplateSteps,
      isOverrideWithRules: false
    }
    this.availableTemplates.push(mortgageLoanTemplate);

    var creditCardTemplateSteps = [this.stageMap.get("Application Review"), this.stageMap.get("Credit Check"),
    this.stageMap.get("Proof of Income"),
    this.stageMap.get("Loan Final Approval")];

    var creditCardTemplate: Template = {
      name: "Credit Consolidation",
      steps: creditCardTemplateSteps,
      isOverrideWithRules: false
    }
    this.availableTemplates.push(creditCardTemplate);


  }

  getStageMap(): Map<string, Step> {
    return this.stageMap;
  }

  getTemplates(): Template[] {
    return this.availableTemplates;
  }

  addTemplate(template: Template) {
    this.availableTemplates.push(template);
  }

  setTemplate(templateList: Template[]) {
    this.availableTemplates = templateList;
  }

  updateKieSettings(kieSettings: KieSettings) {
    this.kieSettings = kieSettings;
    this.cookieService.putObject("kieSettings", this.kieSettings);
  }

  getCurrentKieSettings(): KieSettings {
    return this.kieSettings;
  }

  getSteps(applicant: Applicant, loan: Loan) {
    let postObject: RootObject = { lookup: "stateless-session" };

    let commandList: Command[] = [];
    let insertCommand1: Command = {};
    let insertCommand2: Command = {};
    let insertCommand3: Command = {};
    let insertCommand4: Command = {};
    let insertCommand5: Command = {};
    let insertCommand6: Command = {};

    let applicantInfo: ApplicantWrapper = {
      "com.redhat.ba.Applicant": applicant
    }
    let insert1Obj: Insert = {};
    insert1Obj = {
      object: applicantInfo
    }
    insertCommand1.insert = insert1Obj;


    let loanInfo: LoanWrapper = {
      "com.redhat.ba.Loan": loan
    }
    let insert2Obj: Insert = {};
    insert2Obj = {
      object: loanInfo
    }
    insertCommand2.insert = insert2Obj;


    let processRequirements: ProcessRequirementsWrapper = {
      "com.redhat.ba.ProcessRequirements": {}
    }
    let insert3Obj: Insert = {};
    insert3Obj = {
      object: processRequirements
    }
    insertCommand3.insert = insert3Obj;
    insert3Obj["out-identifier"] = "processRequirement";
    insert3Obj["return-object"] = false;


    insertCommand6 = {
      "set-focus": "sla"
    }

    insertCommand4 = {
      ["fire-all-rules"]: {}
    };

    insertCommand5 = {
      ["get-objects"]: {
        ["out-identifier"]: "objects"
      }
    };

    commandList.push(insertCommand1);
    commandList.push(insertCommand2);
    commandList.push(insertCommand3);
    commandList.push(insertCommand6);
    commandList.push(insertCommand4);
    commandList.push(insertCommand5);

    postObject.commands = commandList;

    let url = this.kieSettings.baseurl + "/services/rest/server/containers/instances/" + this.kieSettings.dmcontainerAlias;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json'
    };

    return this.http.post(url, postObject, { headers });
  }

  getStepsDMN(applicant: Applicant, loan: Loan,request : ServiceRequest){
    var postObj = {
      "model-namespace": "https://kiegroup.org/dmn/_2E7F0174-0917-4BF7-8B0A-CA5E4A9BE634",
      "model-name": "rules",
      "decision-name": ["DecideTemplate"],
      "decision-id": [],
      "dmn-context": {
        "applicant" : applicant,
        "loanInfo" : loan
      }
    }

    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.dmcontainerAlias+"/dmn";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json'
    };

   request.request = postObj;

    return this.http.post(url, postObj, { headers });
    
  }


  getCarrier() {
    let url = "http://localhost:3000/getCarriers";
    return this.http.get(url);
  }

  getQuote(request: ServiceRequest, debugUrl: string) {
    //  delete customerRequest.fromLocationObj;
    //  delete customerRequest.toLocationObj;
    let postData = {

    }

    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.dmcontainerAlias + "/dmn";
    debugUrl = url;
    //"http://localhost:8080/kie-server/services/rest/server/containers/NTGRules_1.0.0-SNAPSHOT/dmn";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };

    /*     delete postData["dmn-context"]["Customer Request"].fromLocationObj;
        delete postData["dmn-context"]["Customer Request"].toLocationObj; */
    request.request = postData;

    return this.http.post(url, postData, { headers });

  }


  private getCaseDueDate(template: Template): string {
    let dueDate: string = null;
    let numofdays: number = 0;
    template.steps.forEach((step: Step) => {
      numofdays = numofdays + step.sla;
    });
    dueDate = "P" + numofdays + "D";
    return dueDate;
  }

  private getStagedueDate(template: Template, stageNum: number): string {
    let dueDate: string = null;
    template.steps.forEach((step: Step) => {
      if (step.step == stageNum)
        dueDate = "P" + step.sla + "D";
    });
    if (dueDate == null)
      dueDate = "P10D";
    return dueDate;
  }

  submitRequest(applicant: Applicant, loan: Loan, template: Template) {
    let totalAmount: number = 0.0;
    let postData = {
      "case-data": {
        "applicant": applicant,
        "loan": loan,
        "templateName": template.name,
        "stage1_dueDate": this.getStagedueDate(template, 1),
        "stage2_dueDate": this.getStagedueDate(template, 2),
        "stage3_dueDate": this.getStagedueDate(template, 3),
        "stage4_dueDate": this.getStagedueDate(template, 4),
        "stage5_dueDate": this.getStagedueDate(template, 5),
        "stage6_dueDate": this.getStagedueDate(template, 6),
        "stage7_dueDate": this.getStagedueDate(template, 7),
        "stage8_dueDate": this.getStagedueDate(template, 8),
        "globalDueDate": this.getCaseDueDate(template),
      },
      "case-user-assignments": {
        "owner": "pamAdmin"
      }
    }


    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/" + this.kieSettings.processId + "/instances";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };

    console.log(postData);

    return this.http.post(url, postData, { headers });
  }

  getCaseInstances(type: string) {
    let status: string;
    if (type == "Active")
      status = "open";
    else
      status = "closed";
    let url = this.kieSettings.baseurl + "/services/rest/server/queries/cases/instances?status=" + status + "&page=0&pageSize=100&sortOrder=true";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });

  }

  getProcessInstanceForCase(caseId: string, type: string) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/processes/instances";
    if (type == "closed")
      url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/processes/instances?status=2";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });

  }

  getCaseVariables(processInstanceId: string) {
    let url = this.kieSettings.baseurl + "/services/rest/server/queries/cases/instances/" + processInstanceId + "/caseFile?page=0&pageSize=100"
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });

  }

  updateCaseVariables(caseId: string, postData: object) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/caseFile";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };

    return this.http.post(url, postData, { headers });
  }

  getSVGImage(processInstanceId: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/images/processes/instances/" + processInstanceId +
      "?svgCompletedColor=%23d8fdc1&svgCompletedBorderColor=%23030303&svgActiveBorderColor=%23FF0000";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'accept': 'application/svg+xml',
      'content-type': 'application/svg+xml'
    };
    return this.http.get(url, { headers, responseType: 'text' });
  }


  getActiveTaskInstances(processInstanceId: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/queries/tasks/instances/process/" + processInstanceId;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });
  }

  getTaskVariables(taskInstanceId: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/tasks/" + taskInstanceId + "?withInputData=true&withOutputData=true&withAssignments=true";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });
  }


  updateTaskStatus(taskInstanceId: number, taskStatus: string, cred: Credentials) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/tasks/" + taskInstanceId + "/states/" + taskStatus + "?user=" + this.kieSettings.username;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.put(url, "", { headers });
  }


  completeTaskAutoProgress(taskInstanceId: number, taskStatus: string, cred: Credentials) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/tasks/" + taskInstanceId + "/states/" + taskStatus + "?user=" + this.kieSettings.username + '&auto-progress=true';
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.put(url, "", { headers });
  }

  updateVariables(taskInstanceId: number, data: any, cred: Credentials) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/tasks/" + taskInstanceId + "/contents/output";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.put(url, data, { headers });
  }

  signalEvent(processInstanceId: number, signalName: string, shipmentRequest: any) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/processes/instances/" + processInstanceId + "/signal/" + signalName;
    let postData = shipmentRequest;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };

    return this.http.post(url, postData, { headers });

  }


  getCaseCurrentNodes(caseId: string) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/nodes/instances";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };

    return this.http.get(url, { headers });
  }


  abortOutstandingTask(nodeInstanceId: number, processInstanceId: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/admin/containers/" + this.kieSettings.picontainerAlias + "/processes/instances/" + processInstanceId + "/nodeinstances/" + nodeInstanceId;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'X-KIE-ContentType': 'JSON',
      'accept': 'application/json'
    };
    return this.http.delete(url, { headers });
  }

  triggerAdhocTask(nodeName: string, caseId: string, postdata: object) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/tasks/" + nodeName;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };
    return this.http.put(url, postdata, { headers });
  }

  getProcessMileStoneSteps() {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/processes/definitions/" + this.kieSettings.processId;
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };

    return this.http.get(url, { headers });

  }


  getProcessNodes(processInstanceID: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/queries/processes/instances/" + processInstanceID + "/nodes/instances?page=0&pageSize=100";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };

    return this.http.get(url, { headers });
  }

  getSLATimers(processInstanceID: number) {
    let url = this.kieSettings.baseurl + "/services/rest/server/admin/containers/" + this.kieSettings.picontainerAlias + "/processes/instances/" + processInstanceID + "/timers";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };

    return this.http.get(url, { headers });
  }

  updateSLATimer(processInstanceID: number, timerid: number, days: number) {
    var delay = days * 24 * 3600; //convert to seconds
    var postData = {
      period: 0,
      delay: delay,
      repeatLimit: -1
    }
    let url = this.kieSettings.baseurl + "/services/rest/server/admin/containers/" + this.kieSettings.picontainerAlias + "/processes/instances/" + processInstanceID + "/timers/" + timerid + "?relative=true";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };
    return this.http.put(url, postData, { headers });

  }

  addCaseComment(caseId: String, postdata: string) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/comments";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };


    return this.http.post(url, '"' + postdata + '"', { headers });
  }

  getCaseComments(caseId: String) {
    let url = this.kieSettings.baseurl + "/services/rest/server/containers/" + this.kieSettings.picontainerAlias + "/cases/instances/" + caseId + "/comments";
    const headers = {
      'Authorization': 'Basic ' + btoa(this.kieSettings.username + ":" + this.kieSettings.password),
      'content-type': 'application/json',
      'accept': 'application/json'
    };
    return this.http.get(url, { headers });
  }

}