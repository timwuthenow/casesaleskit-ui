import { Component, OnInit,Input } from '@angular/core';
import { PAMServices } from 'src/app/service/PAMServices';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Step } from 'src/app/Models/Requests/Request';

@Component({
  selector: 'app-UpdateDueDate',
  templateUrl: './UpdateDueDate.component.html',
  styleUrls: ['./UpdateDueDate.component.css']
})
export class UpdateDueDateComponent implements OnInit {

  stageMap : Map<string,object>;
  selectedStep : string;
  service : PAMServices;
  availableStep : Step[] = new Array();;
  faTimesCircle = faTimesCircle;

  constructor(public activeModal: NgbActiveModal,service : PAMServices) {
        this.service = service;
  }

  ngOnInit() {
      this.stageMap = this.service.getStageMap();
      this.stageMap.forEach((value : Step,key : string) => {
        this.availableStep.push(value);
      });
        

  }

  onUpdate(step : Step)
  {
      this.activeModal.close(step);
  }

  dismiss()
  {
    this.activeModal.dismiss();
  }

  onAdd()
  {
      this.activeModal.close(this.selectedStep);
  }

}
