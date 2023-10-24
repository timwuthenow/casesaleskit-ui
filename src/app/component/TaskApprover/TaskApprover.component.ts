import { Component, OnInit, ElementRef, ViewChild, Input } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ProcessInstanceList, TaskInstanceList, TaskInstance, Template, Step } from '../../Models/Requests/Request';
import { UserRole } from 'src/app/Models/UserRole';
import { PAMServices } from 'src/app/service/PAMServices';
import { ApprovalTaskComponent } from 'src/app/component/Modals/ApprovalTask/ApprovalTask.component';

@Component({
  selector: 'app-TaskApprover',
  templateUrl: './TaskApprover.component.html',
  styleUrls: ['./TaskApprover.component.css']
})
export class TaskApproverComponent implements OnInit {

  closeResult: string;
  name: string;
  @Input() user: UserRole;
  activeProcessInstances: ProcessInstanceList[] = new Array();
  closedProcessInstances: ProcessInstanceList[] = new Array();
  activeManagerTasks: TaskInstanceList = {
    instanceList: new Array()
  };
  svgContent: string;
  allowSvgContent: boolean = false;
  allowShowStep: boolean = false;
  service: PAMServices;
  templates: Template[];
  currentTemplate: Template;
  stageMap: Map<string, Step>;

  constructor(private modalService: NgbModal, service: PAMServices) {
    this.service = service;
    this.getCaseList();
  }

  ngOnInit() {
    this.templates = this.service.getTemplates();
    this.stageMap = this.service.getStageMap();
  }

  getCaseList() {
    this.activeProcessInstances = new Array();
    this.activeManagerTasks.instanceList = new Array();
    this.service.getCaseInstances("Active").subscribe((res: any) => {
      this.buildCaseList(res, this.activeProcessInstances, "Active");
    }, err => { console.log(err) });
  }


  private buildCaseList(response: any, caseList: ProcessInstanceList[], type: string) {
    let currentStatus = "Active";
    if (type != "Active")
      currentStatus = "Completed";

    if (response["instances"] && response["instances"] instanceof Array) {
      response["instances"].forEach((instance: any) => {
        let processInstance: ProcessInstanceList = {
          caseId: instance["case-id"],
          status: currentStatus,
          startedDate: instance["case-started-at"],
          dueDate: instance["case-sla-due-date"]
        }
        this.service.getProcessInstanceForCase(processInstance.caseId, null).subscribe((data: any) => {
          if (data["process-instance"] instanceof Array) {
            let instanceID = data["process-instance"][0]["process-instance-id"]
            processInstance.processInstanceId = instanceID;
          }
        })
        if (instance["case-definition-id"] == this.service.getCurrentKieSettings().processId)
          caseList.push(processInstance);
      });
      caseList = caseList.sort((a: ProcessInstanceList, b: ProcessInstanceList) => {
        if (a.processInstanceId >= b.processInstanceId)
          return -1;
        else
          return 1;
      });

      setTimeout(() => {
        if (type == "Active")
          this.buildVariablesList(caseList);
      }, 1000);
    }
  }

  private buildVariablesList(caseList: ProcessInstanceList[]) {
    caseList.forEach((currentInstance: ProcessInstanceList) => {
      this.service.getCaseVariables(currentInstance.caseId).subscribe((res: any) => {
        this.mapVariableNameValue(res, currentInstance);
        this.onGetActiveTask(currentInstance.processInstanceId, this.user.userid, currentInstance.caseId);
      }, err => {

      });
    });

  }

  private mapVariableNameValue(res: any, caseInstance: ProcessInstanceList) {
    if (res.instances instanceof Array) {
      res.instances.forEach((element: any) => {
        if (element.name == "templateName")
          this.setTemplate(element.value, caseInstance);
      });

    }
  }

  onGetActiveTask(processInstanceId: number, userid: string, caseId: string) {
    this.service.getActiveTaskInstances(processInstanceId).subscribe((res: any) => {
      if (res["task-summary"] && res["task-summary"] instanceof Array) {
        res["task-summary"].forEach((task: any) => {
          let taskInstance: TaskInstance = {
            caseId: caseId,
            processInstanceId: processInstanceId,
            taskCreatedDate: task["task-created-on"]["java.util.Date"],
            taskId: task["task-id"],
            taskName: task["task-name"],
            taskSubject: task["task-subject"],
            taskDescription: task["task-description"]
          }
          this.activeManagerTasks.instanceList.push(taskInstance);

        });
      }
    }, err => { });
  }

  getTaskVaribles(taskid: number, taskInstance: TaskInstance) {
    this.service.getTaskVariables(taskid).subscribe((res: any) => {
      console.log(res);
      this.openApprovalTask(res, taskInstance);
    }, err => { })
  }


  private openApprovalTask(response: any, taskInstance: TaskInstance) {
    const modalRef = this.modalService.open(ApprovalTaskComponent, { ariaLabelledBy: 'modal-basic-title', size: 'xl', backdrop: 'static' });

    modalRef.result.then((result) => {

      // window.alert("New Process Instance is created : " + result);
      // 
      this.invokeNext(taskInstance);
      this.getCaseList();

    }, (reason) => {
      this.closeResult = "Dismissed";

      this.getCaseList();

    });

    modalRef.componentInstance.taskResponse = response;
    modalRef.componentInstance.currentUser = this.user;
    modalRef.componentInstance.taskInstance = taskInstance;
  }


  private invokeNext(instance: TaskInstance) {
    this.activeProcessInstances.forEach((processInstance: ProcessInstanceList) => {
      if (processInstance.processInstanceId == instance.processInstanceId) {
        let currentTemplate = processInstance.template;
        this.service.getCaseVariables(processInstance.caseId).subscribe((response: any) => {
          let stage1_completed: boolean = false;
          let stage2_completed: boolean = false;
          let stage3_completed: boolean = false;
          let stage4_completed: boolean = false;
          let stage5_completed: boolean = false;
          let stage6_completed: boolean = false;
          let stage7_completed: boolean = false;
          let stage8_completed: boolean = false;

          stage1_completed = this.checkCompleted(response, "stage1_status");
          stage2_completed = this.checkCompleted(response, "stage2_status");
          stage3_completed = this.checkCompleted(response, "stage3_status");
          stage4_completed = this.checkCompleted(response, "stage4_status");
          stage5_completed = this.checkCompleted(response, "stage5_status");
          stage6_completed = this.checkCompleted(response, "stage6_status");
          stage7_completed = this.checkCompleted(response, "stage7_status");
          stage8_completed = this.checkCompleted(response, "stage8_status");

          currentTemplate.steps.forEach((step: Step) => {
            if (step.stage == "stage1")
              step.isCompleted = stage1_completed;
            if (step.stage == "stage2")
              step.isCompleted = stage2_completed;
            if (step.stage == "stage3")
              step.isCompleted = stage3_completed;
            if (step.stage == "stage4")
              step.isCompleted = stage4_completed;
            if (step.stage == "stage5")
              step.isCompleted = stage5_completed;
            if (step.stage == "stage6")
              step.isCompleted = stage6_completed;
            if (step.stage == "stage7")
              step.isCompleted = stage7_completed;
            if (step.stage == "stage8")
              step.isCompleted = stage8_completed;  
          });

          for (let i = 0; i < currentTemplate.steps.length; i++) {
            let step: Step = currentTemplate.steps[i];
            if (!step.isCompleted) {
              console.log("Next Step to be Triggered " + step.name);
              if (!step.isTriggered) {
                this.service.triggerAdhocTask(step.name, processInstance.caseId, {}).subscribe();
                step.isTriggered = true;
              }
              break;
            }
          }


        });


        /*  currentTemplate.steps.forEach((step : Step) => {
            if(step.isCompleted === undefined)
            {
                console.log("Next Step : " + step.name);
                return;
            }
         }); */
      }
    });
  }

  private checkCompleted(response: any, name: string): boolean {
    let result: boolean = false;
    response.instances.forEach(element => {
      if (element.name == name) {
        if (element.value == "completed")
          result = true;
      }

    });
    return result;

  }

  private setTemplate(templateName: string, caseInstance: ProcessInstanceList) {
    this.templates.forEach((rec: Template) => {
      if (rec.name == templateName)
        caseInstance.template = rec;
    });
    if (caseInstance.template === undefined)
      caseInstance.template = this.templates[0];
  }


}
