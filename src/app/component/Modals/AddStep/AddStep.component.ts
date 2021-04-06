import { Component, OnInit,Input } from '@angular/core';
import { PAMServices } from 'src/app/service/PAMServices';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-AddStep',
  templateUrl: './AddStep.component.html',
  styleUrls: ['./AddStep.component.css']
})
export class AddStepComponent implements OnInit {

  faTimesCircle = faTimesCircle;
  @Input() availableStep : any;

  selectedStep : string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
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
