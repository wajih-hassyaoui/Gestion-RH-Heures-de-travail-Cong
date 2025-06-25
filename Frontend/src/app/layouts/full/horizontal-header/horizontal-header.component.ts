import { Component } from '@angular/core';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/authentification/AuthServices/authentication.service';
import { TokenService } from 'src/app/authentification/AuthServices/token.service';

@Component({
  selector: 'app-horizontal-header',
  templateUrl: './horizontal-header.component.html',
  styleUrls: []
})
export class HorizontalAppHeaderComponent {
  public config: PerfectScrollbarConfigInterface = {};
  isShowProfile:boolean=true

  // This is for Notifications
  notifications: Object[] = [
    {
      round: 'round-danger',
      icon: 'ti-link',
      title: 'Luanch Admin',
      subject: 'Just see the my new admin!',
      time: '9:30 AM'
    },
    {
      round: 'round-success',
      icon: 'ti-calendar',
      title: 'Event today',
      subject: 'Just a reminder that you have event',
      time: '9:10 AM'
    },
    {
      round: 'round-info',
      icon: 'ti-settings',
      title: 'Settings',
      subject: 'You can customize this template as you want',
      time: '9:08 AM'
    },
    {
      round: 'round-primary',
      icon: 'ti-user',
      title: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: 'assets/images/users/1.jpg',
      status: 'online',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:30 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'busy',
      from: 'Sonu Nigam',
      subject: 'I have sung a song! See you at',
      time: '9:10 AM'
    },
    {
      useravatar: 'assets/images/users/2.jpg',
      status: 'away',
      from: 'Arijit Sinh',
      subject: 'I am a singer!',
      time: '9:08 AM'
    },
    {
      useravatar: 'assets/images/users/4.jpg',
      status: 'offline',
      from: 'Pavan kumar',
      subject: 'Just see the my admin!',
      time: '9:00 AM'
    }
  ];

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us'
  }

  public languages: any[] = [{
    language: 'English',
    code: 'en',
    type: 'US',
    icon: 'us'
  },

  {
    language: 'Français',
    code: 'fr',
    icon: 'fr'
  }]
  cureentuser: any;
  nameUser: any;
  Usercase: any;



  constructor(private translate: TranslateService,private auth:AuthenticationService,private localStorageRole:TokenService) {
    translate.setDefaultLang('en');
  }
  ngOnInit(): void {
    this.showProfile();
  }
  changeLanguage(lang: any) {
    this.translate.use(lang.code)
    this.selectedLanguage = lang;
  }
  showProfile():void{
    if(this.localStorageRole.getRole()=='superadmin'){
      this.isShowProfile=false

    }else{
      this.isShowProfile=true

    }

  }
  logout()
  {
    this.auth.logout();

  }
  public getuser()
  {

/*      this.cureentuser=this.auth.getCurentUser();
 */     this.cureentuser="wajih"
    /*   this.nameUser=JSON.parse( this.cureentuser).name;  */
    this.nameUser="wajih"
      this.Usercase=  this.nameUser.slice(0,1).toUpperCase() ;
      if(this.cureentuser === null)
       {
        this.nameUser="wajih";
       }
      console.log("aaaaaaaa",  this.nameUser);

  }

}
