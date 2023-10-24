import { Component, OnInit, Input } from '@angular/core';
import { Applicant, Loan, ProcessRequirements, ServiceRequest, ServiceResponse, Step, StepWrapper, Template } from 'src/app/Models/Requests/Request';
import { UserRole } from 'src/app/Models/UserRole';
import { PAMServices } from 'src/app/service/PAMServices';
import { faUser,faTerminal } from '@fortawesome/free-solid-svg-icons';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DebugModalComponent } from '../Modals/debug-modal/debug-modal.component';

@Component({
  selector: 'app-Applicant',
  templateUrl: './Applicant.component.html',
  styleUrls: ['./Applicant.component.css']
})
export class ApplicantComponent implements OnInit {

  serviceRequest : ServiceRequest = {
    request : {}
  };

  serviceResponse : ServiceResponse = {
    response : {}
  };

  estimatedTotalDays : number;
  applicantList: Applicant[];
  service: PAMServices;
  applicant: Applicant;
  loan: Loan;
  stageMap: Map<string, Step>;
  templates: Template[];
  currentTemplate: Template;
  faUser = faUser;
  faTerminal = faTerminal;
  processRequirements: ProcessRequirements;

  @Input() user: UserRole;

  constructor(private modalService: NgbModal,service: PAMServices) {
    this.service = service;
    this.stageMap = this.service.getStageMap();
    this.templates = this.service.getTemplates();
  }



  ngOnInit() {
    this.applicantList = [{
      name: "Applicant 1",
      age: 40,
      annualIncome: 80000,
      bank: "Goldguard Bank Inc.",
      loanamount: 5000,
      monthlyDebt: 2000,
      ssn: "123-23-2334",
      state: "TX"
    }, {
      name: "Applicant 2",
      age: 40,
      annualIncome: 90000,
      bank: "Green Market Bank",
      loanamount: 50000,
      monthlyDebt: 2000,
      ssn: "122-23-2334",
      state: "NC"
    }
    ]
    this.loan = {
      amount: 5000,
      applicationDate: "2021-03-25",
      stateDelivered: "New",
      type: "Personal"
    };

    this.applicant = this.applicantList[0];
    this.currentTemplate = this.service.getTemplates()[0];
    this.getTotalDue();
  }


  getRequiredSteps() {
    /* this.service.getSteps(this.applicant,this.loan).subscribe((data : any ) => {
        console.log(data);
        if(data.result && data.result["execution-results"].results && data.result["execution-results"].results instanceof Array)
        {
            var objects = data.result["execution-results"].results[0].value;
            console.log(objects);
            this.processRequirements = objects[2];
            this.converttoTemplate();
        }
    }); */

    this.service.getStepsDMN(this.applicant, this.loan,this.serviceRequest).subscribe((data: any) => {
      this.serviceResponse.response = data;
      if (data.result && data.result["dmn-evaluation-result"]["dmn-context"]) {
        this.processRequirements = {
          steps: data.result["dmn-evaluation-result"]["dmn-context"].DecideTemplate
        };
        this.converttoTemplate();
      }
    });
  }

  private converttoTemplate() {
    this.currentTemplate = {
      isOverrideWithRules: true,
      name: "Result from Rules (" + this.loan.type + "-" + this.loan.amount + " )",
      steps: new Array()
    };

    this.processRequirements.steps.forEach((rec: any) => {
      var currentSla = rec.sla;
      var currentStep: Step = {
        isNew: false,
        name: rec.name,
        stage: this.stageMap.get(rec.name).stage,
        sla: parseInt(currentSla.split("D")[0].split("P")[1]),
        slaunit: "Days",
        step: rec.sequenceNumber,
        order: rec.sequenceNumber,
        isTriggered: false
      }

      this.currentTemplate.steps.push(currentStep);
      this.getTotalDue();
    });

    var isAvailable = false;
    this.templates.forEach((rec: Template) => {
      if (rec.name == "Result from Rules") {
        isAvailable = true;
        rec.steps = this.currentTemplate.steps;
      }
    });

    if (!isAvailable) {
      this.templates.push(this.currentTemplate);
      //this.service.addTemplate(template);
    } else {

    }



  }


  getTotalDue()
  {
    this.estimatedTotalDays = 0;
    this.currentTemplate.steps.forEach((step : Step) => {
      this.estimatedTotalDays = this.estimatedTotalDays + step.sla;
    });
  }


  createCase() {
    this.service.submitRequest(this.applicant, this.loan, this.currentTemplate).subscribe((data: any) => {
      window.alert("Case Instance Created : " + data);
      this.service.triggerAdhocTask(this.currentTemplate.steps[0].name, data, {}).subscribe();
    });
  }

  openDebug() {
    const modalRef = this.modalService.open(DebugModalComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });

    modalRef.result.then((result) => {

    }, (reason) => {
     
    });

    modalRef.componentInstance.debug = {
      response : this.serviceResponse,
      request : this.serviceRequest,
      url : this.service.getCurrentKieSettings().baseurl + "/services/rest/server/containers/" + this.service.getCurrentKieSettings().dmcontainerAlias+"/dmn"
    }
    
  }


}
